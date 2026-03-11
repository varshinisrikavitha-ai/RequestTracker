const { Router } = require('express');
const statusController = require('../controllers/status.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateStatusSchema } = require('../validators/status.validator');

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent

router.use(authenticate);

// POST /api/requests/:id/status
router.post(
  '/status',
  authorize('ADMIN', 'DEPARTMENT_HEAD'),
  validate(updateStatusSchema),
  statusController.updateStatus
);

// GET /api/requests/:id/status-history
router.get('/status-history', statusController.getStatusHistory);

module.exports = router;
