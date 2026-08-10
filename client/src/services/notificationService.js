import api from "./apiClient";

const normalizeError = (error, fallback) => ({
  message: error.response?.data?.message || error.response?.data?.error || fallback,
  status: error.response?.status,
});

export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch notifications');
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to get unread count');
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to mark notification as read');
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to mark all as read');
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to delete notification');
  }
};

export const getQueueStatus = async () => {
  try {
    const response = await api.get('/notifications/queue/status');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch notification queue status');
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getQueueStatus,
};
