const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const subjectMiddlewares = require('../middlewares/subjectMiddlewares');
const subjectController = require('./../controllers/subjectController');
const rateLimiters = require('./../middlewares/rateLimiters');
const roomRouter = require('./roomRoutes');

const router = express.Router();

router.use('/:subjectId/rooms', roomRouter);

router.use(authMiddlewares.protect);

router
  .route('/')
  .get(subjectMiddlewares.restrictUserViewScope, subjectController.getSubjects)
  .post(
    authMiddlewares.restrictTo('admin', 'classRep'),
    rateLimiters.createSubjectLimiter,
    subjectController.createSubject
  );

router
  .route('/:id')
  .get(subjectController.getSubject)
  .patch(
    authMiddlewares.restrictTo('admin', 'classRep'),
    subjectMiddlewares.validateSubjectOwnership,
    authMiddlewares.checkPassword,
    subjectController.updateSubject
  )
  .delete(
    authMiddlewares.restrictTo('admin', 'classRep'),
    subjectMiddlewares.validateSubjectOwnership,
    authMiddlewares.checkPassword,
    subjectController.closeSubject
  );

module.exports = router;
