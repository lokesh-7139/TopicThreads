const Tag = require('./../models/tagModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const filterObj = require('../utils/filterObject');
const getMissingFields = require('../utils/getMissingFields');

exports.getTags = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tag.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tags = await features.query;

  res.status(200).json({
    status: 'success',
    results: tags.length,
    data: {
      data: tags,
    },
  });
});

exports.createTag = catchAsync(async (req, res, next) => {
  const requiredFields = ['name'];
  const allowedFields = [...requiredFields, 'description'];
  const filteredBody = filterObj(req.body, ...allowedFields);
  const missingFields = getMissingFields(filteredBody, ...requiredFields);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing fields: ${missingFields.join(', ')}`, 400)
    );
  }
  filteredBody.createdBy = req.user.id;

  const newTag = await Tag.create(filteredBody);

  res.status(201).json({
    status: 'success',
    data: {
      data: newTag,
    },
  });
});

exports.getTag = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Tag.findById(req.params.id),
    req.query
  ).limitFields();
  const tag = await features.query;

  if (!tag) {
    return next(new AppError('No tag found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: tag,
    },
  });
});

exports.updateTag = catchAsync(async (req, res, next) => {
  const requiredFields = ['description'];
  const allowedFields = [...requiredFields];
  const filteredBody = filterObj(req.body, allowedFields);
  const missingFields = getMissingFields(filteredBody, ...requiredFields);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing fields: ${missingFields.join(', ')}`, 400)
    );
  }

  req.targetTag.description = filteredBody.description;
  const updatedTag = await req.targetTag.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedTag,
    },
  });
});

exports.deleteTag = catchAsync(async (req, res, next) => {
  await req.targetTag.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
