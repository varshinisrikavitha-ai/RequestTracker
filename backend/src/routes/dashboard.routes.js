const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();
router.use(authenticate);

// GET /api/dashboard/admin
router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);

// GET /api/dashboard/user
router.get('/user', dashboardController.getUserDashboard);

module.exports = router;
