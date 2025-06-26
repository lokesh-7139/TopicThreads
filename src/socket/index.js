const middleware = require('./middleware');
const roomHandler = require('./roomHandler');
const messageHandler = require('./messageHandler');

module.exports = function (io) {
  io.use(middleware.protectIo);

  io.on('connection', (socket) => {
    console.log(`${socket.user.name} connected`);

    socket.on('joinRoom', async (roomId) => {
      try {
        await roomHandler.joinRoom(socket, roomId);
      } catch (err) {
        console.error('Join room failed:', err.message);
        socket.emit('error:room', 'Failed to join room');
        socket.disconnect();
      }
    });

    socket.on('kickUser', async ({ roomId, userId }) => {
      try {
        await roomHandler.kickUser(socket, io, roomId, userId);
      } catch (err) {
        console.error('Kick error:', err.message);
        socket.emit('error:room', err.message);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`${socket.user.name} disconnected: ${reason}`);

      socket.rooms.forEach((roomId) => {
        socket.to(roomId).emit('userLeft', {
          user: {
            id: socket.user.id,
            name: socket.user.name,
            photo: socket.user.photo,
          },
        });
      });
    });

    socket.on('sendMessage', async (data) => {
      try {
        await messageHandler.sendMessage(socket, data);
      } catch (err) {
        console.error('Message error:', err.message);
        socket.emit('error:message', 'Failed to send message');
      }
    });

    socket.on('editMessage', async (data) => {
      try {
        await messageHandler.editMessage(socket, data);
      } catch (err) {
        console.error('Message error:', err.message);
        socket.emit('error:message', 'Failed to edit message');
      }
    });

    socket.on('deleteMessage', async (data) => {
      try {
        await messageHandler.deleteMessage(socket, data);
      } catch (err) {
        console.error('Message error:', err.message);
        socket.emit('error:message', 'Failed to delete message');
      }
    });

    socket.on('reactToMessage', async (data) => {
      try {
        await messageHandler.reactToMessage(socket, data);
      } catch (err) {
        console.error('Message error:', err.message);
        socket.emit('error:message', 'Failed to react to message');
      }
    });

    socket.on('typing', (roomId) => {
      socket.to(roomId).emit('userTyping', { user: socket.user.name });
    });

    socket.on('stopTyping', (roomId) => {
      socket.to(roomId).emit('userStoppedTyping', { user: socket.user.name });
    });
  });
};
