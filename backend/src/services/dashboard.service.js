const { prisma } = require('../config/database');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');

const buildStatusCountMap = (rows) =>
  rows.reduce((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

/**
 * Admin dashboard — global statistics.
 */
const getAdminDashboard = async (query = {}) => {
  const { skip, take, page, limit } = parsePagination(query);

  const [
    totalUsers,
    totalDepartments,
    recentRequests,
    recentRequestsTotal,
    statusBreakdown,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.department.count(),
    prisma.request.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.request.count(),
    prisma.request.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const countsByStatus = buildStatusCountMap(statusBreakdown);
  const pendingRequests =
    (countsByStatus.SUBMITTED || 0) +
    (countsByStatus.UNDER_REVIEW || 0) +
    (countsByStatus.PROCESSING || 0);
  const completedRequests = (countsByStatus.APPROVED || 0) + (countsByStatus.COMPLETED || 0);
  const rejectedRequests = countsByStatus.REJECTED || 0;
  const totalRequests = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);

  return {
    stats: {
      totalRequests,
      pendingRequests,
      completedRequests,
      rejectedRequests,
      totalUsers,
      totalDepartments,
    },
    statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count._all })),
    recentRequests,
    recentRequestsPagination: buildPaginationMeta(recentRequestsTotal, page, limit),
  };
};

/**
 * User dashboard — scoped to the authenticated user.
 */
const getUserDashboard = async (user, query = {}) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = user.role === 'DEPARTMENT_HEAD'
    ? { departmentId: user.departmentId }
    : { createdBy: user.id };

  const [
    recentRequests,
    recentRequestsTotal,
    statusBreakdown,
  ] = await Promise.all([
    prisma.request.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.request.count({ where }),
    prisma.request.groupBy({ by: ['status'], where, _count: { _all: true } }),
  ]);

  const countsByStatus = buildStatusCountMap(statusBreakdown);
  const pendingRequests =
    (countsByStatus.SUBMITTED || 0) +
    (countsByStatus.UNDER_REVIEW || 0) +
    (countsByStatus.PROCESSING || 0);
  const completedRequests = (countsByStatus.APPROVED || 0) + (countsByStatus.COMPLETED || 0);
  const rejectedRequests = countsByStatus.REJECTED || 0;
  const totalRequests = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);

  return {
    stats: { totalRequests, pendingRequests, completedRequests, rejectedRequests },
    recentRequests,
    recentRequestsPagination: buildPaginationMeta(recentRequestsTotal, page, limit),
  };
};

module.exports = { getAdminDashboard, getUserDashboard };
