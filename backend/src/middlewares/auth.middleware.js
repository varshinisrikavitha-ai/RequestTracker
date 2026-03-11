const { verifyToken } = require('../utils/jwt.utils');
const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Authenticate the request using a Bearer JWT token.
 * Attaches `req.user` on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
      },
    });

    if (!user) throw new AppError('User no longer exists.', 401);
    if (!user.isActive) throw new AppError('Your account has been deactivated.', 403);

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

module.exports = { authenticate };
