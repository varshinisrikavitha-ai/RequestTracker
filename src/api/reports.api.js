import api from './axiosClient';

export const getRequestsSummary = (params = {}) =>
  api.get('/reports/requests-summary', { params });

export const getDepartmentPerformance = (params = {}) =>
  api.get('/reports/department-performance', { params });

export const getMonthlyReport = (params = {}) =>
  api.get('/reports/monthly', { params });
