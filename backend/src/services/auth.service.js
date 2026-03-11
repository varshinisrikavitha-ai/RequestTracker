const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { signToken } = require('../utils/jwt.utils');
const AppError = require('../utils/AppError');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Register a new user.
 */
const register = async ({ name, email, password, role = 'STAFF', departmentId }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('A user with this email already exists.', 409);

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, departmentId },
    select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true },
  });

  const token = signToken({ id: user.id, role: user.role });
  return { user, token };
};

/**
 * Login with email + password.
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid email or password.', 401);
  if (!user.isActive) throw new AppError('Account is deactivated. Contact admin.', 403);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password.', 401);

  const token = signToken({ id: user.id, role: user.role });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
};

/**
 * Return the currently authenticated user's profile.
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      department: { select: { id: true, name: true } },
    },
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

module.exports = { register, login, getMe };
