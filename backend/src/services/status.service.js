const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const notificationService = require('./notification.service');

// Allowed status transitions
const ALLOWED_TRANSITIONS = {
  SUBMITTED:    ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED:     ['PROCESSING'],
  REJECTED:     [],
  PROCESSING:   ['COMPLETED'],
  COMPLETED:    [],
};

/**
 * Update the status of a request and record its history.
 * Enforces allowed transitions and RBAC.
 */
const updateStatus = async (requestId, { status, comment }, user) => {
  const request = await prisma.request.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found.', 404);

  // Role-based restrictions
  if (user.role === 'STAFF' || user.role === 'VIEWER') {
    throw new AppError('You are not allowed to update request status.', 403);
  }
  if (user.role === 'DEPARTMENT_HEAD' && request.departmentId !== user.departmentId) {
    throw new AppError('This request does not belong to your department.', 403);
  }

  // Validate transition
  const allowed = ALLOWED_TRANSITIONS[request.status];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Cannot transition from ${request.status} to ${status}. Allowed: ${allowed.join(', ') || 'none'}`,
      400
    );
  }

  // Update request + create history entry in a transaction
  const [updatedRequest] = await prisma.$transaction([
    prisma.request.update({
      where: { id: requestId },
      data: { status },
      include: {
        creator: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.requestStatusHistory.create({
      data: { requestId, status, comment, updatedBy: user.id },
    }),
  ]);

  // Notify request creator
  await notificationService.createNotification(
    request.createdBy,
    `Your request "${request.title}" status has been updated to: ${status}.${comment ? ` Comment: ${comment}` : ''}`
  );

  return updatedRequest;
};

/**
 * Get the full status history of a request.
 */
const getStatusHistory = async (requestId, user) => {
  const request = await prisma.request.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found.', 404);

  if ((user.role === 'STAFF' || user.role === 'VIEWER') && request.createdBy !== user.id) {
    throw new AppError('Access denied.', 403);
  }

  return prisma.requestStatusHistory.findMany({
    where: { requestId },
    orderBy: { createdAt: 'asc' },
    include: { updatedByUser: { select: { id: true, name: true, role: true } } },
  });
};

module.exports = { updateStatus, getStatusHistory };
