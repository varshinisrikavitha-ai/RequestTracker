const { z } = require('zod');

const createNotificationSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  message: z.string().min(1, 'Message is required').max(500),
});

module.exports = { createNotificationSchema };
