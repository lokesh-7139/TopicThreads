const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const Room = require('./roomModel');

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Message must belong to a room'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must belong to a user'],
      index: true,
    },
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    type: {
      type: String,
      required: [true, 'Message must belong to a type'],
      enum: ['text', 'image', 'file'],
    },
    text: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
    },
    reactions: [
      {
        emoji: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.virtual('isReply').get(function () {
  return !!this.repliedTo;
});

messageSchema.pre('save', function (next) {
  if (this.type === 'text' && (!this.text || this.text.trim() === '')) {
    return next(new AppError('Text message content cannot be empty', 400));
  }
  if ((this.type === 'image' || this.type === 'file') && !this.fileUrl) {
    return next(new AppError(`${this.type} must include a file URL`, 400));
  }
  next();
});

messageSchema.pre(/^find/, function (next) {
  if (this.getOptions().excludeDeleted) {
    this.find({ isDeleted: false });
  }
  if (this.getOptions().populateSender) {
    this.populate({
      path: 'senderId',
      select: 'name email photo role',
    });
  }
  if (this.getOptions().populateReactions) {
    this.populate({
      path: 'reactions.userId',
      select: 'name email photo role',
    });
  }
  next();
});

messageSchema.post('save', async function () {
  try {
    const room = await Room.findById(this.roomId);
    if (room) {
      await room.updateActivity();
    }
  } catch (err) {
    console.error('Error updating room activity:', err.message);
  }
});

messageSchema.methods.softDelete = async function () {
  this.repliedTo = undefined;
  this.type = 'text';
  this.text = 'Message deleted';
  this.fileUrl = undefined;
  this.reactions = undefined;
  this.isEdited = undefined;
  this.isDeleted = true;
  await this.save();
};

messageSchema.methods.edit = async function ({ text, fileUrl }) {
  if (this.type === 'text') {
    if (!text || text.trim() === '') {
      throw new AppError('Text message cannot be empty', 400);
    }
    this.text = text.trim();
  } else if (this.type === 'image' || this.type === 'file') {
    if (!fileUrl) {
      throw new AppError(`${this.type} message must include a file URL`, 400);
    }
    this.fileUrl = fileUrl;
    if (text) {
      this.text = text;
    }
  }

  this.isEdited = true;
  await this.save();
};

messageSchema.methods.toggleReaction = async function (emoji, userId) {
  const existing = this.reactions.find(
    (r) => r.userId.toString() === userId.toString()
  );

  if (existing) {
    if (existing.emoji === emoji) {
      this.reactions = this.reactions.filter(
        (r) => r.userId.toString() !== userId.toString()
      );
    } else {
      this.reactions = this.reactions.filter(
        (r) => r.userId.toString() !== userId.toString()
      );
      this.reactions.push({ emoji, userId });
    }
  } else {
    this.reactions.push({ emoji, userId });
  }

  await this.save();
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
