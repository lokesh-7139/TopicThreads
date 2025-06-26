exports.limitUserFields = (req, res, next) => {
  const fieldsAllowed = [
    'name',
    'email',
    'year',
    'branch',
    'batch',
    'photo',
    'role',
  ];
  let fields = [];
  if (req.query.fields) {
    let fieldsAsked = req.query.fields.split(',');
    fields = fieldsAsked.filter((field) => fieldsAllowed.includes(field));
    if (fields.length === 0) {
      return next(new AppError('No valid fields requested', 400));
    }
  } else {
    fields = [...fieldsAllowed];
  }
  req.query.fields = fields.join(',');
  next();
};

exports.restrictUserViewScope = (req, res, next) => {
  if (req.user.role !== 'admin') {
    req.query.year = req.user.year;
    req.query.branch = req.user.branch;
  }
  next();
};

exports.isClassRepOfUser = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.params.id);
  if (!currentUser) {
    return next(new AppError('No user found with that ID', 404));
  }
  if (
    req.user.role !== 'admin' &&
    (req.user.year !== currentUser.year ||
      req.user.branch !== currentUser.branch)
  ) {
    return next(new AppError('You cannot update or delete this user', 403));
  }
  req.targetUser = currentUser;
  next();
});
