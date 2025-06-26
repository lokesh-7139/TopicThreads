const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const userMiddlewares = require('../middlewares/userMiddlewares');
const userController = require('./../controllers/userController');

const router = express.Router();

router.use(authMiddlewares.protect);

router
  .route('/')
  .get(
    userMiddlewares.restrictUserViewScope,
    userMiddlewares.limitUserFields,
    userController.getUsers
  );

router
  .route('/:id')
  .get(userMiddlewares.limitUserFields, userController.getUser)
  .patch(
    authMiddlewares.restrictTo('admin', 'classRep'),
    userMiddlewares.isClassRepOfUser,
    authMiddlewares.checkPassword,
    userController.modifyUserRole
  )
  .delete(
    authMiddlewares.restrictTo('admin', 'classRep'),
    userMiddlewares.isClassRepOfUser,
    authMiddlewares.checkPassword,
    userController.deleteUser
  );

router
  .route('/toggle-status')
  .patch(
    authMiddlewares.restrictTo('admin', 'classRep'),
    userMiddlewares.isClassRepOfUser,
    authMiddlewares.checkPassword,
    userController.toggleUserStatus
  );

module.exports = router;
