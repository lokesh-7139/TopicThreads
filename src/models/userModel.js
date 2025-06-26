const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      maxlength: [30, 'Name must have less than or equal to 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (val) {
          return validator.isEmail(val) && val.endsWith('@itbhu.ac.in');
        },
        message: 'Please provide a valid @itbhu.ac.in email',
      },
    },
    year: {
      type: Number,
      required: [true, 'Please specify your current year in engineering.'],
      enum: {
        values: [1, 2, 3, 4, 5],
        message: 'Year must be between 1 and 5.',
      },
    },
    branch: {
      type: String,
      required: [true, 'Branch is required.'],
      enum: {
        values: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'], // Change these branches after.
        message: 'Branch must be one of: CSE, ECE, EEE, ME, CE, IT.',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'classRep', 'admin'],
        message: 'Role must be one of: student, classRep',
      },
      default: 'student',
    },
    batch: {
      type: Number,
      required: [true, 'Batch (admission year) is required'],
    },
    photo: {
      type: String,
      enum: [
        'avatar1.png',
        'avatar2.png',
        'avatar3.png',
        'avatar4.png',
        'avatar5.png',
        'avatar6.png',
        'avatar7.png',
        'avatar8.png',
      ],
      default: 'avatar1.png',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      maxlength: 24,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: Number,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    resendAttempts: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        name: String,
        awardedAt: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.virtual('passwordConfirm').set(function (val) {
  this._passwordConfirm = val;
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && this.password !== this._passwordConfirm) {
    this.invalidate('passwordConfirm', 'Passwords did not matched');
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeInactiveUsers) {
    this.find({
      isActive: {
        $ne: false,
      },
    });
  }
  next();
});

userSchema.methods.isValidEmail = function () {
  const email = this.email;
  return validator.isEmail(email) && email.endsWith('@itbhu.ac.in');
};

userSchema.methods.extractBranchAndBatch = function () {
  const email = this.email;
  const match = email.match(/\.([a-zA-Z]{2,4})(\d{2})@/);
  if (!match) return null;

  const branch = match[1].toUpperCase();
  const yearSuffix = parseInt(match[2]);
  const fullYear = 2000 + yearSuffix;

  return { branch, batch: fullYear };
};

userSchema.methods.getAcademicYear = function () {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const admissionYear = this.batch;
  let year = currentYear - admissionYear;
  if (currentMonth > 6) {
    year += 1;
  }

  return year;
};

userSchema.methods.verifyUser = function () {
  if (!this.isValidEmail()) {
    return false;
  }

  const result = this.extractBranchAndBatch();
  if (result === null) {
    return false;
  }
  const { branch, batch } = result;
  if (branch !== this.branch || batch !== this.batch) {
    return false;
  }

  const year = this.getAcademicYear();

  console.log(
    `Email: ${this.email}, Extracted: ${branch}, ${batch}, Calculated Year: ${year}, Provided Year: ${this.year}`
  );

  return year === this.year;
};

userSchema.methods.checkPassword = async function (
  passwordEntered,
  passwordCurrent
) {
  return await bcrypt.compare(passwordEntered, passwordCurrent);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
