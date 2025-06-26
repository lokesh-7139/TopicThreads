const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const fieldsAllowed = ['name', 'photo'];
  const filteredbody = filterObj(req.body, ...fieldsAllowed);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredbody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { isActive: false },
    { runValidators: false }
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
