const mongoose = require('mongoose');
const Room = require('./../models/roomModel');

exports.isRoomActive = async (roomId) => {
  roomId = roomId.toString();
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return false;
  }
  const room = await Room.findById(roomId);
  return room && !room.isClosed;
};
