const { prisma } = require('../config/database');

/**
 * Overall requests summary.
 */
const requestsSummary = async () => {
  const [total, byStatus, byPriority] = await Promise.all([
    prisma.request.count(),
    prisma.request.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.request.groupBy({ by: ['priority'], _count: { _all: true } }),
  ]);

  return {
    total,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count._all })),
  };
};

/**
 * Performance per department.
 */
const departmentPerformance = async () => {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      requests: {
        select: { status: true },
      },
    },
  });

  return departments.map((dept) => {
    const total = dept.requests.length;
    const completed = dept.requests.filter((r) => r.status === 'COMPLETED').length;
    const pending = dept.requests.filter((r) =>
      ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(r.status)
    ).length;
    const rejected = dept.requests.filter((r) => r.status === 'REJECTED').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { id: dept.id, name: dept.name, total, completed, pending, rejected, completionRate };
  });
};

/**
 * Monthly request trends (last 12 months).
 */
const monthlyReport = async () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const requests = await prisma.request.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true, status: true },
  });

  const months = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: key, submitted: 0, completed: 0, rejected: 0, total: 0 };
  }

  requests.forEach((r) => {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      months[key].total++;
      if (r.status === 'COMPLETED') months[key].completed++;
      if (r.status === 'REJECTED') months[key].rejected++;
      months[key].submitted++;
    }
  });

  return Object.values(months);
};

module.exports = { requestsSummary, departmentPerformance, monthlyReport };
