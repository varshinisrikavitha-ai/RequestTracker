import api from './axiosClient';

export const getAdminDashboard = (params = {}) =>
  api.get('/dashboard/admin', { params });

export const getUserDashboard = (params = {}) =>
  api.get('/dashboard/user', { params });
