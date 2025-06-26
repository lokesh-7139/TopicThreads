const Subject = require('./../models/subjectModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const filterObj = require('../utils/filterObject');
const getMissingFields = require('../utils/getMissingFields');

exports.getSubjects = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Subject.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const subjects = await features.query;

  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: {
      data: subjects,
    },
  });
});

exports.createSubject = catchAsync(async (req, res, next) => {
  const requiredFields = ['name', 'code'];
  const filteredBody = filterObj(req.body, ...requiredFields, 'description');
  const missingFields = getMissingFields(filteredBody, ...requiredFields);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing fields: ${missingFields.join(', ')}`, 400)
    );
  }
  filteredBody.batch = req.user.batch;
  filteredBody.year = req.user.year;
  filteredBody.branch = req.user.branch;
  filteredBody.createdBy = req.user.id;

  const newSubject = await Subject.create(filteredBody);

  res.status(201).json({
    status: 'success',
    data: {
      data: newSubject,
    },
  });
});

exports.getSubject = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Subject.findById(req.params.id),
    req.query
  ).limitFields();
  const subject = await features.query;

  if (!subject) {
    return next(new AppError('No Subject found', 404));
  }

  if (req.user.year !== subject.year || req.user.branch !== subject.branch) {
    return next(new AppError('You cannot view this subject', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: subject,
    },
  });
});

exports.updateSubject = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'code', 'description'];
  const filteredBody = filterObj(req.body, ...allowedFields);
  Object.assign(req.targetSubject, filteredBody);

  const updatedSubject = await req.targetSubject.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedSubject,
    },
  });
});

exports.closeSubject = catchAsync(async (req, res, next) => {
  req.targetSubject.isClosed = true;
  req.targetSubject.closedAt = new Date();
  req.targetSubject.closedBy = req.user.id;

  await req.targetSubject.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      data: req.targetSubject,
    },
  });
});
