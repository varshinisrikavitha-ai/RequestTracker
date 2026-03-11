const { prisma } = require('../config/database');

/**
 * Admin dashboard — global statistics.
 */
const getAdminDashboard = async () => {
  const [
    totalRequests,
    pendingRequests,
    completedRequests,
    totalUsers,
    totalDepartments,
    recentRequests,
    statusBreakdown,
  ] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'] } },
    }),
    prisma.request.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.department.count(),
    prisma.request.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.request.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  return {
    stats: {
      totalRequests,
      pendingRequests,
      completedRequests,
      totalUsers,
      totalDepartments,
    },
    statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count._all })),
    recentRequests,
  };
};

/**
 * User dashboard — scoped to the authenticated user.
 */
const getUserDashboard = async (user) => {
  const where = user.role === 'DEPARTMENT_HEAD'
    ? { departmentId: user.departmentId }
    : { createdBy: user.id };

  const [
    totalRequests,
    pendingRequests,
    completedRequests,
    rejectedRequests,
    recentRequests,
  ] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.count({
      where: { ...where, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'] } },
    }),
    prisma.request.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.request.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.request.findMany({
      where,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    stats: { totalRequests, pendingRequests, completedRequests, rejectedRequests },
    recentRequests,
  };
};

module.exports = { getAdminDashboard, getUserDashboard };
