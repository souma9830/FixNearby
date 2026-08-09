import api from './apiClient.js';

/**
 * Get analytics for a specific worker
 * @param {string} workerId - The ID of the worker
 * @returns {Promise<Object>} The analytics data
 */
export const getWorkerAnalytics = async (workerId) => {
  const response = await api.get(`/analytics/worker/${workerId}`);
  return response.data;
};

/**
 * Get analytics for the currently authenticated worker
 * @returns {Promise<Object>} The analytics data
 */
export const getMyAnalytics = async () => {
  const response = await api.get('/analytics/worker/me');
  return response.data;
};

/**
 * Get the worker leaderboard
 * @param {number} [limit=10] - The number of workers to return
 * @param {string} [sortBy='karmaScore'] - The field to sort by (karmaScore, averageRating, reviewCount)
 * @returns {Promise<Object>} The leaderboard data
 */
export const getLeaderboard = async (limit = 10, sortBy = 'karmaScore') => {
  const response = await api.get(`/analytics/leaderboard`, {
    params: { limit, sortBy },
  });
  return response.data;
};

/**
 * Get service demand analytics
 * @returns {Promise<Object>} The service demand data
 */
export const getServiceDemand = async () => {
  const response = await api.get('/analytics/demand');
  return response.data;
};
