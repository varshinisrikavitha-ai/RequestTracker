const { Router } = require('express');
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();
router.use(authenticate, authorize('ADMIN', 'DEPARTMENT_HEAD'));

// GET /api/reports/requests-summary
router.get('/requests-summary', reportController.requestsSummary);

// GET /api/reports/department-performance
router.get('/department-performance', reportController.departmentPerformance);

// GET /api/reports/monthly
router.get('/monthly', reportController.monthlyReport);

module.exports = router;
