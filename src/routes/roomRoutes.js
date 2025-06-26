const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const roomMiddlewares = require('../middlewares/roomMiddlewares');
const roomController = require('./../controllers/roomController');
const rateLimiters = require('./../middlewares/rateLimiters');
const messageRouter = require('./../routes/messageRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:roomId/messages', messageRouter);

router.use(authMiddlewares.protect);

router
  .route('/')
  .get(roomMiddlewares.isSubjectInUserScope, roomController.getRooms)
  .post(rateLimiters.createRoomLimiter, roomController.createRoom);

router
  .route('/:id')
  .get(roomMiddlewares.isSubjectInUserScope, roomController.getRoom)
  .patch(roomMiddlewares.isCreatorOfRoom, roomController.updateRoom)
  .delete(
    roomMiddlewares.isCreatorOfRoom,
    authMiddlewares.checkPassword,
    roomController.closeRoom
  );

module.exports = router;
