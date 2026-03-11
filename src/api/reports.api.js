import api from './axiosClient';

export const getRequestsSummary = () =>
  api.get('/reports/requests-summary');

export const getDepartmentPerformance = () =>
  api.get('/reports/department-performance');

export const getMonthlyReport = () =>
  api.get('/reports/monthly');
