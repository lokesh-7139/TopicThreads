const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const tagMiddlewares = require('../middlewares/tagMiddlewares');
const tagController = require('./../controllers/tagController');

const router = express.Router();

router.use(authMiddlewares.protect);

router
  .route('/')
  .get(tagController.getTags)
  .post(
    authMiddlewares.restrictTo('admin', 'classRep'),
    tagController.createTag
  );

router
  .route('/:id')
  .get(tagController.getTag)
  .patch(tagMiddlewares.isCreatorOfTag, tagController.updateTag)
  .delete(
    tagMiddlewares.isCreatorOfTag,
    tagMiddlewares.isTagInUse,
    authMiddlewares.checkPassword,
    tagController.deleteTag
  );

module.exports = router;
