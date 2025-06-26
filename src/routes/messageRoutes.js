const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const messageMiddlewares = require('../middlewares/messageMiddlewares');
const messageController = require('./../controllers/messageController');

const router = express.Router({ mergeParams: true });

router.use(authMiddlewares.protect);

router
  .route('/')
  .get(
    messageMiddlewares.isRoomInUserScope,
    messageController.getMessagesInRoom
  );

router
  .route('/:id')
  .get(
    messageMiddlewares.isRoomInUserScope,
    messageController.getMessageInRoom
  );

module.exports = router;
