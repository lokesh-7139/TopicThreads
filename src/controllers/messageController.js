const Message = require('./../models/messageModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.getMessagesInRoom = catchAsync(async (req, res, next) => {
  req.query.sort = 'createdAt';
  const features = new APIFeatures(
    Message.find().setOptions({
      populateSender: true,
      populateReactions: true,
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const messages = await features.query;

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      data: messages,
    },
  });
});

exports.getMessageInRoom = catchAsync(async (req, res, next) => {
  req.query.id = req.params.id;
  const features = new APIFeatures(
    Message.find().setOptions({
      populateSender: true,
      populateReactions: true,
    }),
    req.query
  )
    .filter()
    .limitFields();
  const messages = await features.query;
  const message = messages[0];

  if (!message) {
    return next(new AppError('No message found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: message,
    },
  });
});
