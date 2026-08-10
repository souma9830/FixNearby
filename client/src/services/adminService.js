import api from './apiClient';

const normalizeError = (error, fallback) => ({
  message: error.response?.data?.message || error.response?.data?.error || fallback,
  status: error.response?.status,
});

/**
 * Fetch overview analytics, 30-day trend stats, recent activity, and system health.
 */
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch admin stats');
  }
};

/**
 * Fetch paginated users and workers with role/status filters and search query.
 */
export const getAdminUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch users list');
  }
};

/**
 * Fetch list of workers.
 */
export const getAdminWorkers = async () => {
  try {
    const response = await api.get('/admin/workers');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch workers list');
  }
};

/**
 * Ban or unban a user or worker account.
 * @param {string} id
 * @param {boolean} [isBanned]
 */
export const banUser = async (id, isBanned) => {
  try {
    const response = await api.put(`/admin/users/${id}/ban`, { isBanned });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to update account ban status');
  }
};

/**
 * Fetch user or worker booking history.
 * @param {string} id
 */
export const getUserBookings = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}/bookings`);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch user booking history');
  }
};

export default {
  getAdminStats,
  getAdminUsers,
  getAdminWorkers,
  banUser,
  getUserBookings,
};
