const AppError = require('../utils/AppError');

/**
 * Global Express error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Prisma-specific errors ─────────────────────────────────────────────────
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.join(', ') ?? 'field';
    message = `A record with that ${field} already exists.`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause ?? 'Record not found.';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Related record not found. Check foreign key reference.';
  }

  // ── JWT errors (in case they bubble up) ───────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // ── Development: include stack trace ──────────────────────────────────────
  const response = { success: false, message };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
