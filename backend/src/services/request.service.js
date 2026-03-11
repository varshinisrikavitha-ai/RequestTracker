const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');
const notificationService = require('./notification.service');

const REQUEST_INCLUDE = {
  category: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  creator: { select: { id: true, name: true, email: true } },
};

/**
 * Create a new request (with optional file attachment).
 */
const createRequest = async ({ title, description, priority, categoryId, departmentId }, userId, file) => {
  const attachmentUrl = file ? `/uploads/${file.filename}` : null;

  const request = await prisma.request.create({
    data: { title, description, priority, categoryId, departmentId, createdBy: userId, attachmentUrl },
    include: REQUEST_INCLUDE,
  });

  // Seed initial status history
  await prisma.requestStatusHistory.create({
    data: { requestId: request.id, status: 'SUBMITTED', comment: 'Request submitted', updatedBy: userId },
  });

  // Notify the creator
  await notificationService.createNotification(
    userId,
    `Your request "${title}" has been submitted successfully.`
  );

  return request;
};

/**
 * Get all requests with filtering, pagination and search.
 * ADMIN / DEPARTMENT_HEAD see all; STAFF sees only their own.
 */
const getRequests = async (query, user) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};

  // Scope for non-admin roles
  if (user.role === 'STAFF' || user.role === 'VIEWER') {
    where.createdBy = user.id;
  } else if (user.role === 'DEPARTMENT_HEAD') {
    where.departmentId = user.departmentId;
  }

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.departmentId && user.role === 'ADMIN') where.departmentId = query.departmentId;
  if (query.categoryId) where.categoryId = query.categoryId;

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const orderBy = { [query.sortBy || 'createdAt']: query.order || 'desc' };

  const [requests, total] = await Promise.all([
    prisma.request.findMany({ skip, take, where, orderBy, include: REQUEST_INCLUDE }),
    prisma.request.count({ where }),
  ]);

  return { requests, pagination: buildPaginationMeta(total, page, limit) };
};

/**
 * Get a single request by ID.
 */
const getRequestById = async (id, user) => {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      ...REQUEST_INCLUDE,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: { updatedByUser: { select: { id: true, name: true } } },
      },
    },
  });

  if (!request) throw new AppError('Request not found.', 404);

  // Access control
  if (
    (user.role === 'STAFF' || user.role === 'VIEWER') &&
    request.createdBy !== user.id
  ) {
    throw new AppError('You do not have permission to view this request.', 403);
  }
  if (user.role === 'DEPARTMENT_HEAD' && request.departmentId !== user.departmentId) {
    throw new AppError('This request does not belong to your department.', 403);
  }

  return request;
};

/**
 * Delete a request (admin only or creator's own request if SUBMITTED).
 */
const deleteRequest = async (id, user) => {
  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new AppError('Request not found.', 404);

  if (user.role !== 'ADMIN') {
    if (request.createdBy !== user.id)
      throw new AppError('You can only delete your own requests.', 403);
    if (request.status !== 'SUBMITTED')
      throw new AppError('You can only delete requests that are still in SUBMITTED status.', 403);
  }

  await prisma.request.delete({ where: { id } });
};

/**
 * Update an existing request (creator only, while status is SUBMITTED).
 * Admin may update any field regardless of status.
 */
const updateRequest = async (id, body, user, file) => {
  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new AppError('Request not found.', 404);

  if (user.role !== 'ADMIN') {
    if (request.createdBy !== user.id)
      throw new AppError('You can only edit your own requests.', 403);
    if (request.status !== 'SUBMITTED')
      throw new AppError('Requests can only be edited while in SUBMITTED status.', 403);
  }

  const data = { ...body };
  if (file) data.attachmentUrl = `/uploads/${file.filename}`;

  const updated = await prisma.request.update({
    where: { id },
    data,
    include: REQUEST_INCLUDE,
  });

  return updated;
};

module.exports = { createRequest, getRequests, getRequestById, deleteRequest, updateRequest };
