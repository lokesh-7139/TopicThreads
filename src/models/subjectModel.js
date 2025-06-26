const mongoose = require('mongoose');
const User = require('./userModel');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [50, 'Subject name must be under 50 characters'],
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
      validate: {
        validator: function (val) {
          return /^[A-Z]{1,5}\d{1,5}$/.test(val);
        },
        message: 'Subject code must be like CS101, ME204, etc.',
      },
    },
    batch: {
      type: Number,
      required: [true, 'Batch year is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      enum: {
        values: [1, 2, 3, 4],
        message: 'Year must be between 1 and 4.',
      },
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: {
        values: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'], // Change these branches after.
        message: 'Branch must be one of: CSE, ECE, EEE, ME, CE, IT.',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
  },
  { timestamps: true }
);

subjectSchema.index({ name: 1, code: 1, batch: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
