const { prisma } = require('../config/database');

const buildRequestScope = (user) => {
  if (!user) return {};
  if (user.role === 'STAFF' || user.role === 'VIEWER') return { createdBy: user.id };
  if (user.role === 'DEPARTMENT_HEAD') return { departmentId: user.departmentId };
  return {};
};

const parseDateRange = (query = {}) => {
  const range = {};

  if (query.startDate) {
    const startDate = new Date(`${query.startDate}T00:00:00.000`);
    if (!Number.isNaN(startDate.getTime())) {
      range.gte = startDate;
    }
  }

  if (query.endDate) {
    const endDate = new Date(`${query.endDate}T23:59:59.999`);
    if (!Number.isNaN(endDate.getTime())) {
      range.lte = endDate;
    }
  }

  return Object.keys(range).length > 0 ? range : null;
};

const buildRequestWhere = (user, query) => {
  const where = buildRequestScope(user);
  const createdAt = parseDateRange(query);

  if (createdAt) {
    where.createdAt = createdAt;
  }

  return where;
};

const buildMonthBuckets = (query) => {
  const createdAt = parseDateRange(query);
  const endDate = createdAt?.lte || new Date();
  const startDate = createdAt?.gte || new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);

  const buckets = {};
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cursor <= endMonth) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = {
      month: key,
      submitted: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      total: 0,
    };
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
};

/**
 * Overall requests summary.
 */
const requestsSummary = async (user, query = {}) => {
  const where = buildRequestWhere(user, query);

  const [total, byStatus, byPriority] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.request.groupBy({ by: ['priority'], where, _count: { _all: true } }),
  ]);

  return {
    total,
    byStatus:   Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])),
    byPriority: Object.fromEntries(byPriority.map((p) => [p.priority, p._count._all])),
  };
};

/**
 * Performance per department.
 */
const departmentPerformance = async (user, query = {}) => {
  const requestWhere = buildRequestWhere(user, query);
  const departmentWhere = {};

  if (user?.role === 'DEPARTMENT_HEAD' && user.departmentId) {
    departmentWhere.id = user.departmentId;
  }

  if (user?.role === 'STAFF' || user?.role === 'VIEWER') {
    departmentWhere.requests = { some: requestWhere };
  }

  const departments = await prisma.department.findMany({
    where: departmentWhere,
    select: {
      id: true,
      name: true,
      requests: {
        where: requestWhere,
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
const monthlyReport = async (user, query = {}) => {
  const where = buildRequestWhere(user, query);

  const requests = await prisma.request.findMany({
    where,
    select: { createdAt: true, status: true },
  });

  const months = buildMonthBuckets(query);

  requests.forEach((r) => {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      months[key].total++;
      if (r.status === 'APPROVED') months[key].approved++;
      if (r.status === 'COMPLETED') months[key].completed++;
      if (r.status === 'REJECTED') months[key].rejected++;
      months[key].submitted++;
    }
  });

  return Object.values(months);
};

module.exports = { requestsSummary, departmentPerformance, monthlyReport };
