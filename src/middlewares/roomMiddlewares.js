const Subject = require('./../models/subjectModel');
const Room = require('./../models/roomModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.isSubjectInUserScope = catchAsync(async (req, res, next) => {
  const subjectId = req.params.subjectId || req.query.subjectId;
  if (!subjectId) {
    return next(new AppError('SubjectId is required for this action', 400));
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return next(new AppError('Invalid subjectId: no such subject exists', 400));
  }

  if (subject.year !== req.user.year || subject.branch !== req.user.branch) {
    return next(new AppError('You cannot view rooms under this Subject', 403));
  }

  req.query.subjectId = subjectId;
  next();
});

exports.isCreatorOfRoom = catchAsync(async (req, res, next) => {
  const targetRoom = await Room.findById(req.params.id).populate({
    path: 'subjectId',
    select: 'batch branch year',
  });
  if (!targetRoom) {
    return next(new AppError('No room found', 404));
  }
  if (targetRoom.isClosed) {
    return next(new AppError('You cannot update or close a closed room'));
  }
  if (
    req.user.role === 'user' &&
    targetRoom.createdBy.toString() !== req.user.id
  ) {
    return next(new AppError('You cannot update or close this subject'));
  }
  if (
    req.user.role === 'classRep' &&
    (targetRoom.subjectId.batch !== req.user.batch ||
      targetRoom.subjectId.branch !== req.user.branch ||
      targetRoom.subjectId.year !== req.user.year)
  ) {
    return next(new AppError('You cannot update or close this subject'));
  }

  req.targetRoom = targetRoom;
  next();
});
