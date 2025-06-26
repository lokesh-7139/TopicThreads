const Room = require('./../models/roomModel');

exports.isRoomInUserScope = catchAsync(async (req, res, next) => {
  const roomId = req.params.roomId || req.query.roomId;
  if (!roomId) {
    return next(new AppError('RoomId is required for this action', 400));
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return next(new AppError('Invalid roomId: no such room exists', 400));
  }

  const subject = room.subjectId;
  if (subject.year !== req.user.year || subject.branch !== req.user.branch) {
    return next(new AppError('You cannot view this room', 403));
  }

  req.query.roomId = roomId;
  next();
});
