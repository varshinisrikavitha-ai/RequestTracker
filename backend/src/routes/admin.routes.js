const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  departmentSchema,
  categorySchema,
  createUserSchema,
  updateUserSchema,
} = require('../validators/admin.validator');

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// ─── Departments ──────────────────────────────────────────────────────────────
router.post('/departments', validate(departmentSchema), adminController.createDepartment);
router.get('/departments', adminController.getDepartments);
router.get('/departments/:id', adminController.getDepartmentById);
router.put('/departments/:id', validate(departmentSchema), adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// ─── Categories ───────────────────────────────────────────────────────────────
router.post('/categories', validate(categorySchema), adminController.createCategory);
router.get('/categories', adminController.getCategories);
router.get('/categories/:id', adminController.getCategoryById);
router.put('/categories/:id', validate(categorySchema), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', validate(createUserSchema), adminController.createUser);
router.put('/users/:id', validate(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
