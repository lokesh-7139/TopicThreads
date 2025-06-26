const Message = require('../models/messageModel');
const utils = require('./utils');

exports.sendMessage = async (socket, data) => {
  const { roomId, type, text, fileUrl, repliedTo } = data;
  roomId = roomId.toString();

  const isActive = await utils.isRoomActive(roomId);
  if (!isActive) {
    socket.emit('error:room', 'Room is closed or does not exist');
    socket.disconnect();
    return;
  }

  const newMessage = await Message.create({
    senderId: socket.user.id,
    roomId,
    type,
    text: type === 'text' ? text : undefined,
    fileUrl: type !== 'text' ? fileUrl : undefined,
    repliedTo,
  });

  await newMessage.populate({
    path: 'senderId',
    select: 'name email photo role',
  });

  socket.to(roomId).emit('newMessage', newMessage);
  socket.emit('messageSent', newMessage);
};

exports.editMessage = async (socket, data) => {
  const { messageId, type, text, fileUrl } = data;

  const message = await Message.findById(messageId);
  if (!message) {
    return socket.emit('error:message', 'Message not found');
  }
  if (message.senderId.toString() !== socket.user.id) {
    return socket.emit('error:message', 'You can only edit your messages');
  }

  const isActive = await utils.isRoomActive(message.roomId);
  if (!isActive) {
    socket.emit('error:message', 'Room is closed or does not exist');
    socket.disconnect();
    return;
  }

  message.type = type;
  await message.edit({ text, fileUrl });

  socket.to(message.roomId.toString()).emit('messageEdited', message);
  socket.emit('messageEdited', message);
};

exports.deleteMessage = async (socket, { messageId }) => {
  const message = await Message.findById(messageId);
  if (!message) {
    return socket.emit('error:message', 'Message not found');
  }
  if (message.senderId.toString() !== socket.user.id) {
    return socket.emit('error:message', 'You can only delete your messages');
  }

  const isActive = await utils.isRoomActive(message.roomId);
  if (!isActive) {
    socket.emit('error:message', 'Room is closed or does not exist');
    socket.disconnect();
    return;
  }

  await message.softDelete();
  socket.to(message.roomId.toString()).emit('messageDeleted', message);
  socket.emit('messageDeleted', message);
};

exports.reactToMessage = async (socket, data) => {
  const { messageId, emoji } = data;
  const message = await Message.findById(messageId);
  if (!message) {
    return socket.emit('error:message', 'Message not found');
  }

  const isActive = await utils.isRoomActive(message.roomId);
  if (!isActive) {
    socket.emit('error:message', 'Room is closed or does not exist');
    socket.disconnect();
    return;
  }

  await message.toggleReaction(emoji, socket.user.id);
  socket.to(message.roomId.toString()).emit('reactedToMessage', message);
  socket.emit('reactedToMessage', message);
};
