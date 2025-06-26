const Room = require('./../models/roomModel');
const Subject = require('./../models/subjectModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const filterObj = require('../utils/filterObject');
const getMissingFields = require('../utils/getMissingFields');

exports.getRooms = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Room.find().setOptions({
      populateSubject: true,
      populateUser: true,
      populateTags: true,
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const rooms = await features.query;

  res.status(200).json({
    status: 'success',
    results: rooms.length,
    data: {
      data: rooms,
    },
  });
});

exports.createRoom = catchAsync(async (req, res, next) => {
  const requiredFields = ['subjectId', 'title'];
  const allowedFields = ['subjectId', 'title', 'description', 'tags'];
  const filteredBody = filterObj(req.body, ...allowedFields);
  const missingFields = getMissingFields(filteredBody, ...requiredFields);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing fields: ${missingFields.join(', ')}`, 400)
    );
  }

  const subject = await Subject.findById(filteredBody.subjectId);
  if (!subject) {
    return next(new AppError('Invalid subjectId: no such subject exists', 400));
  }
  if (
    subject.year !== req.user.year ||
    subject.branch !== req.user.branch ||
    subject.batch !== req.user.batch
  ) {
    return next(new AppError('You cannot create rooms in this Subject', 400));
  }
  if (subject.isClosed) {
    return next(new AppError('Subject is closed, Cannot create room', 400));
  }

  filteredBody.createdBy = req.user.id;
  filteredBody.lastActivity = new Date();

  const newRoom = await Room.create(filteredBody);

  res.status(201).json({
    status: 'success',
    data: {
      data: newRoom,
    },
  });
});

exports.getRoom = catchAsync(async (req, res, next) => {
  req.query.id = req.params.id;
  const features = new APIFeatures(
    Room.find().setOptions({
      populateSubject: true,
      populateUser: true,
      populateTags: true,
    }),
    req.query
  )
    .filter()
    .limitFields();
  const rooms = await features.query;
  const room = rooms[0];

  if (!room) {
    return next(new AppError('No room found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: room,
    },
  });
});

exports.updateRoom = catchAsync(async (req, res, next) => {
  const allowedFields = ['title', 'description'];
  const filteredBody = filterObj(req.body, ...allowedFields);
  Object.assign(req.targetRoom, filteredBody);

  const updatedRoom = await req.targetRoom.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedRoom,
    },
  });
});

exports.closeRoom = catchAsync(async (req, res, next) => {
  req.targetRoom.isClosed = true;
  req.targetRoom.closedAt = new Date();
  req.targetRoom.closedBy = req.user.id;

  await req.targetRoom.save({ validateBeforeSave: false });

  const roomId = req.targetRoom.id.toString();
  const io = req.app.get('io');

  io.to(roomId).emit('roomClosed', `Room has been closed by ${req.user.name}`);
  io.in(roomId).socketsLeave(roomId);

  res.status(200).json({
    status: 'success',
    data: {
      data: req.targetRoom,
    },
  });
});
