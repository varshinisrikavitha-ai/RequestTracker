const { Router } = require('express');

const authRoutes         = require('./routes/auth.routes');
const adminRoutes        = require('./routes/admin.routes');
const requestRoutes      = require('./routes/request.routes');
const statusRoutes       = require('./routes/status.routes');
const reportRoutes       = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');
const dashboardRoutes    = require('./routes/dashboard.routes');

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
