const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createNotificationSchema } = require('../validators/notification.validator');

const router = Router();
router.use(authenticate);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// POST /api/notifications — admin sends a notification to a user
router.post(
  '/',
  authorize('ADMIN'),
  validate(createNotificationSchema),
  notificationController.createNotification
);

// POST /api/notifications/mark-read
router.post('/mark-read', notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
