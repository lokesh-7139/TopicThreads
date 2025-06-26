const Tag = require('./../models/tagModel');
const Room = require('./../models/roomModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.isCreatorOfTag = catchAsync(async (req, res, next) => {
  const targetTag = await Tag.findById(req.params.id);
  if (!targetTag) {
    return next(new AppError('No tag found with that Id', 404));
  }
  if (
    req.user.role === 'classRep' &&
    targetTag.createdBy.toString() !== req.user.id
  ) {
    return next(new AppError('You cannot update or delete this tag', 403));
  }

  req.targetTag = targetTag;
  next();
});

exports.isTagInUse = catchAsync(async (req, res, next) => {
  const isUsed = await Room.exists({
    tags: req.params.id,
    isClosed: false,
  });

  if (isUsed) {
    return next(
      new AppError('Tag is in use by active rooms and cannot be deleted', 400)
    );
  }

  next();
});
