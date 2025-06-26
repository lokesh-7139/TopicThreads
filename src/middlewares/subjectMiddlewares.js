const Subject = require('./../models/subjectModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.restrictUserViewScope = (req, res, next) => {
  if (req.user.role !== 'admin') {
    req.query.year = req.user.year;
    req.query.branch = req.user.branch;
  }
  next();
};

exports.validateSubjectOwnership = catchAsync(async (req, res, next) => {
  const targetSubject = await Subject.findById(req.params.id);
  if (!targetSubject) {
    return next(new AppError('No subject found', 404));
  }
  if (targetSubject.isClosed) {
    return next(new AppError('You cannot update or close a closed subject'));
  }
  if (
    req.user.role === 'classRep' &&
    (req.user.year !== targetSubject.year ||
      req.user.branch !== targetSubject.branch ||
      req.user.batch !== targetSubject.batch)
  ) {
    return next(new AppError('You cannot update or close this subject'));
  }

  req.targetSubject = targetSubject;
  next();
});
