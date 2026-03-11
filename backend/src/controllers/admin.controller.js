const adminService = require('../services/admin.service');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');

// ─── Departments ─────────────────────────────────────────────────────────────
const createDepartment = async (req, res, next) => {
  try {
    const dept = await adminService.createDepartment(req.body);
    sendSuccess(res, dept, 'Department created', 201);
  } catch (err) { next(err); }
};

const getDepartments = async (req, res, next) => {
  try {
    const { departments, pagination } = await adminService.getDepartments(req.query);
    sendPaginated(res, departments, pagination, 'Departments fetched');
  } catch (err) { next(err); }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await adminService.getDepartmentById(req.params.id);
    sendSuccess(res, dept, 'Department fetched');
  } catch (err) { next(err); }
};

const updateDepartment = async (req, res, next) => {
  try {
    const dept = await adminService.updateDepartment(req.params.id, req.body);
    sendSuccess(res, dept, 'Department updated');
  } catch (err) { next(err); }
};

const deleteDepartment = async (req, res, next) => {
  try {
    await adminService.deleteDepartment(req.params.id);
    sendSuccess(res, null, 'Department deleted');
  } catch (err) { next(err); }
};

// ─── Categories ──────────────────────────────────────────────────────────────
const createCategory = async (req, res, next) => {
  try {
    const cat = await adminService.createCategory(req.body);
    sendSuccess(res, cat, 'Category created', 201);
  } catch (err) { next(err); }
};

const getCategories = async (req, res, next) => {
  try {
    const { categories, pagination } = await adminService.getCategories(req.query);
    sendPaginated(res, categories, pagination, 'Categories fetched');
  } catch (err) { next(err); }
};

const getCategoryById = async (req, res, next) => {
  try {
    const cat = await adminService.getCategoryById(req.params.id);
    sendSuccess(res, cat, 'Category fetched');
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await adminService.updateCategory(req.params.id, req.body);
    sendSuccess(res, cat, 'Category updated');
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await adminService.deleteCategory(req.params.id);
    sendSuccess(res, null, 'Category deleted');
  } catch (err) { next(err); }
};

// ─── Users ───────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await adminService.getUsers(req.query);
    sendPaginated(res, users, pagination, 'Users fetched');
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    sendSuccess(res, user, 'User fetched');
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    sendSuccess(res, user, 'User created', 201);
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    sendSuccess(res, user, 'User updated');
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    sendSuccess(res, null, 'User deleted');
  } catch (err) { next(err); }
};

module.exports = {
  createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment,
  createCategory, getCategories, getCategoryById, updateCategory, deleteCategory,
  getUsers, getUserById, createUser, updateUser, deleteUser,
};
