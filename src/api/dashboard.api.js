import api from './axiosClient';

export const getAdminDashboard = () =>
  api.get('/dashboard/admin');

export const getUserDashboard = () =>
  api.get('/dashboard/user');
