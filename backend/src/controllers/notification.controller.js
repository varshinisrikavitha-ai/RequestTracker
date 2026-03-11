const notificationService = require('../services/notification.service');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');

const getNotifications = async (req, res, next) => {
  try {
    const { notifications, unreadCount, pagination } = await notificationService.getNotifications(
      req.user.id,
      req.query
    );
    sendPaginated(res, { notifications, unreadCount }, pagination, 'Notifications fetched');
  } catch (err) { next(err); }
};

/**
 * POST /api/notifications
 * Admin manually sends a notification to a target user.
 */
const createNotification = async (req, res, next) => {
  try {
    const { userId, message } = req.body;
    const notification = await notificationService.createNotification(userId, message);
    sendSuccess(res, notification, 'Notification sent', 201);
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(
      req.user.id,
      req.body.notificationIds
    );
    sendSuccess(res, result, 'Marked as read');
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.id);
    sendSuccess(res, null, 'Notification deleted');
  } catch (err) { next(err); }
};

module.exports = { getNotifications, createNotification, markAsRead, deleteNotification };
