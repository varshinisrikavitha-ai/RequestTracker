const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// ─── Departments ──────────────────────────────────────────────────────────────

const createDepartment = async ({ name }) => {
  return prisma.department.create({ data: { name } });
};

const getDepartments = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true, requests: true, categories: true } } },
    }),
    prisma.department.count(),
  ]);
  return { departments, pagination: buildPaginationMeta(total, page, limit) };
};

const getDepartmentById = async (id) => {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, requests: true, categories: true } },
      categories: { select: { id: true, name: true } },
    },
  });
  if (!dept) throw new AppError('Department not found.', 404);
  return dept;
};

const updateDepartment = async (id, { name }) => {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new AppError('Department not found.', 404);
  return prisma.department.update({ where: { id }, data: { name } });
};

const deleteDepartment = async (id) => {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new AppError('Department not found.', 404);
  await prisma.department.delete({ where: { id } });
};

// ─── Categories ───────────────────────────────────────────────────────────────

const createCategory = async ({ name, departmentId }) => {
  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) throw new AppError('Department not found.', 404);
  return prisma.category.create({
    data: { name, departmentId },
    include: { department: { select: { id: true, name: true } } },
  });
};

const getCategories = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const where = query.departmentId ? { departmentId: query.departmentId } : {};
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take,
      where,
      orderBy: { name: 'asc' },
      include: { department: { select: { id: true, name: true } } },
    }),
    prisma.category.count({ where }),
  ]);
  return { categories, pagination: buildPaginationMeta(total, page, limit) };
};

const getCategoryById = async (id) => {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!cat) throw new AppError('Category not found.', 404);
  return cat;
};

const updateCategory = async (id, data) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError('Category not found.', 404);
  return prisma.category.update({
    where: { id },
    data,
    include: { department: { select: { id: true, name: true } } },
  });
};

const deleteCategory = async (id) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError('Category not found.', 404);
  await prisma.category.delete({ where: { id } });
};

// ─── Users ────────────────────────────────────────────────────────────────────

const getUsers = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const where = {};
  if (query.role) where.role = query.role;
  if (query.departmentId) where.departmentId = query.departmentId;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, pagination: buildPaginationMeta(total, page, limit) };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true,
      isActive: true, createdAt: true, updatedAt: true,
      department: { select: { id: true, name: true } },
    },
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

const createUser = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('A user with this email already exists.', 409);

  const hashed = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
};

const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found.', 404);

  if (data.password) {
    data.password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, updatedAt: true },
  });
};

const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found.', 404);
  await prisma.user.delete({ where: { id } });
};

module.exports = {
  createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment,
  createCategory, getCategories, getCategoryById, updateCategory, deleteCategory,
  getUsers, getUserById, createUser, updateUser, deleteUser,
};
