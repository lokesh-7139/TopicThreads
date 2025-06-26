const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Room must belong to a subject'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Room title is required'],
      trim: true,
      maxlength: [50, 'Room title must be under 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be under 500 characters'],
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    closedAt: {
      type: Date,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { timestamps: true }
);

roomSchema.index({ subjectId: 1 });
roomSchema.index({ lastActivity: -1 });

roomSchema.pre(/^find/, function (next) {
  if (this.getOptions().populateSubject) {
    this.populate({
      path: 'subjectId',
      select: 'name code batch description year branch',
    });
  }
  if (this.getOptions().populateUser) {
    this.populate({
      path: 'createdBy',
      select: 'name email role photo',
    });
    this.populate({
      path: 'closedBy',
      select: 'name email role photo',
    });
  }
  if (this.getOptions().populateTags) {
    this.populate({
      path: 'tags',
      select: 'name',
    });
  }
});

roomSchema.methods.updateActivity = async function () {
  this.lastActivity = Date.now();
  await this.save();
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
