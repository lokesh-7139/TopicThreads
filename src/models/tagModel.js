const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      lowercase: true,
      maxlength: [25, 'Tag name must be under 30 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description must be under 200 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tag must have a creator'],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

tagSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
