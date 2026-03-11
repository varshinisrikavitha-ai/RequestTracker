import api from './axiosClient';

export const getNotifications = (params = {}) =>
  api.get('/notifications', { params });

export const markAsRead = (notificationIds = []) =>
  api.post('/notifications/mark-read', { notificationIds });

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);
