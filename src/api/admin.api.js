import api from './axiosClient';

// Departments
export const getDepartments = (params = {}) =>
  api.get('/admin/departments', { params });

export const createDepartment = (data) =>
  api.post('/admin/departments', data);

export const updateDepartment = (id, data) =>
  api.put(`/admin/departments/${id}`, data);

export const deleteDepartment = (id) =>
  api.delete(`/admin/departments/${id}`);

// Categories
export const getCategories = (params = {}) =>
  api.get('/admin/categories', { params });

export const createCategory = (data) =>
  api.post('/admin/categories', data);

export const updateCategory = (id, data) =>
  api.put(`/admin/categories/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`);

// Users
export const getUsers = (params = {}) =>
  api.get('/admin/users', { params });

export const createUser = (data) =>
  api.post('/admin/users', data);

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);
