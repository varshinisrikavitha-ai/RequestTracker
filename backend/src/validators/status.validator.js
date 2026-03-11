const { z } = require('zod');

const updateStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'PROCESSING',
    'COMPLETED',
  ]),
  comment: z.string().max(1000).optional(),
});

module.exports = { updateStatusSchema };
