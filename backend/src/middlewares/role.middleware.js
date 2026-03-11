const AppError = require('../utils/AppError');

/**
 * Authorize request for specific roles.
 * Call after `authenticate` middleware.
 *
 * @param {...string} roles - Allowed roles
 * @example router.get('/admin', authenticate, authorize('ADMIN'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. You have: ${req.user.role}`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { authorize };
