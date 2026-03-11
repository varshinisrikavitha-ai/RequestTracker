const { Router } = require('express');

const authRoutes         = require('./auth.routes');
const adminRoutes        = require('./admin.routes');
const requestRoutes      = require('./request.routes');
const statusRoutes       = require('./status.routes');
const reportRoutes       = require('./report.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes    = require('./dashboard.routes');

const router = Router();

router.use('/auth',          authRoutes);
router.use('/admin',         adminRoutes);
router.use('/requests',      requestRoutes);

// Status sub-routes mounted at /requests/:id so params merge correctly:
//   POST   /api/requests/:id/status
//   GET    /api/requests/:id/status-history
router.use('/requests/:id', statusRoutes);

router.use('/reports',       reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard',     dashboardRoutes);

module.exports = router;
