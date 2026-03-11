const { Router } = require('express');
const requestController = require('../controllers/request.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { upload } = require('../middlewares/upload.middleware');
const { createRequestSchema, updateRequestSchema, requestQuerySchema } = require('../validators/request.validator');

const router = Router();

router.use(authenticate);

// POST /api/requests  — create with optional file attachment
router.post(
  '/',
  upload.single('attachment'),
  validate(createRequestSchema),
  requestController.createRequest
);

// GET /api/requests
router.get('/', validate(requestQuerySchema, 'query'), requestController.getRequests);

// GET /api/requests/:id
router.get('/:id', requestController.getRequestById);

// PUT /api/requests/:id — update title/description/priority/category (creator only, SUBMITTED status)
router.put(
  '/:id',
  upload.single('attachment'),
  validate(updateRequestSchema),
  requestController.updateRequest
);

// DELETE /api/requests/:id
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
