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

// All admin routes require authentication at minimum
router.use(authenticate);

// ─── Departments (read: any authenticated user; write: ADMIN only) ─────────────
router.get('/departments',     adminController.getDepartments);
router.get('/departments/:id', adminController.getDepartmentById);
router.post('/departments',    authorize('ADMIN'), validate(departmentSchema), adminController.createDepartment);
router.put('/departments/:id', authorize('ADMIN'), validate(departmentSchema), adminController.updateDepartment);
router.delete('/departments/:id', authorize('ADMIN'), adminController.deleteDepartment);

// ─── Categories (read: any authenticated user; write: ADMIN only) ──────────────
router.get('/categories',     adminController.getCategories);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories',    authorize('ADMIN'), validate(categorySchema), adminController.createCategory);
router.put('/categories/:id', authorize('ADMIN'), validate(categorySchema), adminController.updateCategory);
router.delete('/categories/:id', authorize('ADMIN'), adminController.deleteCategory);

// ─── Users (ADMIN only) ───────────────────────────────────────────────────────
router.get('/users',     authorize('ADMIN'), adminController.getUsers);
router.get('/users/:id', authorize('ADMIN'), adminController.getUserById);
router.post('/users',    authorize('ADMIN'), validate(createUserSchema), adminController.createUser);
router.put('/users/:id', authorize('ADMIN'), validate(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', authorize('ADMIN'), adminController.deleteUser);

module.exports = router;
