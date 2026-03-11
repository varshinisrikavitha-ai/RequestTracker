import api from './axiosClient';

export const getRequests = (params = {}) =>
  api.get('/requests', { params });

export const getRequestById = (id) =>
  api.get(`/requests/${id}`);

export const createRequest = (formData) =>
  api.post('/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateRequest = (id, formData) =>
  api.put(`/requests/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteRequest = (id) =>
  api.delete(`/requests/${id}`);

export const updateStatus = (id, status, comment) =>
  api.post(`/requests/${id}/status`, { status, comment });

export const getStatusHistory = (id) =>
  api.get(`/requests/${id}/status-history`);
