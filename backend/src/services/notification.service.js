const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');
const { sendNotificationEmail } = require('./email.service');

/**
 * Create a notification for a user.
 */
const createNotification = async (userId, message) => {
  const notification = await prisma.notification.create({ data: { userId, message } });

  const recipient = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  const extraRecipients = (process.env.NOTIFICATION_EMAIL_OVERRIDE || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  const recipients = [...new Set([recipient?.email, ...extraRecipients].filter(Boolean))];

  if (recipients.length) {
    await Promise.all(
      recipients.map(async (targetEmail) => {
        try {
          await sendNotificationEmail({
            to: targetEmail,
            subject: 'Request Tracker Notification',
            message,
          });
        } catch (err) {
          // Keep DB notification flow resilient even if mail provider fails.
          console.warn(`Notification email delivery failed to ${targetEmail}:`, err.message);
        }
      })
    );
  }

  return notification;
};

/**
 * Create the same notification for all active admin users.
 */
const createNotificationForAdmins = async (message) => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true },
  });

  if (!admins.length) return [];

  return Promise.all(admins.map((admin) => createNotification(admin.id, message)));
};

/**
 * Get notifications for the authenticated user.
 */
const getNotifications = async (userId, query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const where = { userId };
  if (query.read !== undefined) where.read = query.read === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return { notifications, unreadCount, pagination: buildPaginationMeta(total, page, limit) };
};

/**
 * Mark notifications as read.
 * If notificationIds provided, mark those; otherwise mark all.
 */
const markAsRead = async (userId, notificationIds) => {
  const where = { userId };
  if (notificationIds && notificationIds.length > 0) {
    where.id = { in: notificationIds };
  }
  const { count } = await prisma.notification.updateMany({
    where,
    data: { read: true },
  });
  return { updated: count };
};

/**
 * Delete a specific notification (owner only).
 */
const deleteNotification = async (id, userId) => {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif) throw new AppError('Notification not found.', 404);
  if (notif.userId !== userId) throw new AppError('Access denied.', 403);
  await prisma.notification.delete({ where: { id } });
};

module.exports = {
  createNotification,
  createNotificationForAdmins,
  getNotifications,
  markAsRead,
  deleteNotification,
};
