const User = require('../models/userModel');
const Room = require('../models/roomModel');
const utils = require('./utils');

exports.joinRoom = async (socket, roomId) => {
  roomId = roomId.toString();
  const isActive = await utils.isRoomActive(roomId);
  if (!isActive) {
    return socket.emit('error:room', 'Room is closed or does not exist');
  }

  socket.join(roomId);
  socket.emit('roomJoined', `You joined the room: ${roomId}`);
  socket.to(roomId).emit('userJoined', {
    user: {
      id: socket.user.id,
      name: socket.user.name,
      photo: socket.user.photo,
    },
  });
};

exports.kickUser = async (socket, io, roomId, targetUserId) => {
  const isActive = await utils.isRoomActive(roomId);
  if (!isActive) {
    socket.emit('error:room', 'Room is closed or does not exist');
    return;
  }

  if (!['admin', 'classRep'].includes(socket.user.role)) {
    socket.emit('error:room', 'Permission denied');
    return;
  }

  if (socket.user.id === targetUserId) {
    socket.emit('error:room', 'You cannot kick yourself');
    return;
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    socket.emit('error:room', 'User not found');
    return;
  }

  if (['admin', 'classRep'].includes(targetUser.role)) {
    socket.emit('error:room', 'You cannot kick another admin or classRep');
    return;
  }

  const clients = await io.in(roomId).fetchSockets();
  const targetSocket = clients.find((s) => s.user.id === targetUserId);

  if (targetSocket) {
    targetSocket.leave(roomId);
    targetSocket.emit('kicked', `You were kicked from room: ${roomId}`);
  }

  socket
    .to(roomId)
    .emit('userKicked', `${targetUser.name} was removed from the room`);
  socket.emit('success:room', `Kicked ${targetUser.name}  successfully`);
};
