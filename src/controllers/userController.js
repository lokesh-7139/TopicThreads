const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const filterObj = require('../utils/filterObject');

exports.getUsers = catchAsync(async (req, res, next) => {
  const includeInactiveUsers = ['admin', 'classRep'].includes(req.user.role)
    ? true
    : false;
  const features = new APIFeatures(
    User.find().setOptions({ includeInactiveUsers }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      data: users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const includeInactiveUsers = ['admin', 'classRep'].includes(req.user.role)
    ? true
    : false;
  const features = new APIFeatures(
    User.findById(req.params.id).setOptions({ includeInactiveUsers }),
    req.query
  ).limitFields();
  const user = await features.query;

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (req.user.year !== user.year || req.user.branch !== user.branch) {
    return next(new AppError('You cannot view this user', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

exports.modifyUserRole = catchAsync(async (req, res, next) => {
  const { role } = filterObj(req.body, 'role');
  if (!role) {
    return next(new AppError('Please provide a role to update', 400));
  }
  if (req.targetUser.role === role) {
    return next(new AppError('User already has this role', 400));
  }
  req.targetUser.role = role;
  const updatedUser = await req.targetUser.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedUser,
    },
  });
});

exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  req.targetUser.isActive = !req.targetUser.isActive;
  await req.targetUser.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      user: req.targetUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await req.targetUser.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
