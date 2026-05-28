// client/src/services/favoriteService.js

import api from "./apiClient";

const BASE_URL = "/api/favorites";

/**
 * Add a worker to favorites
 * @param {string} workerId
 */
export const addFavorite = async (workerId) => {
  const response = await api.post(`${BASE_URL}/${workerId}`, {});
  return response.data;
};

/**
 * Remove a worker from favorites
 * @param {string} workerId
 */
export const removeFavorite = async (workerId) => {
  const response = await api.delete(`${BASE_URL}/${workerId}`);
  return response.data;
};

/**
 * Toggle bookmark — adds if not bookmarked, removes if bookmarked
 * @param {string} workerId
 * @param {boolean} isCurrentlyBookmarked
 */
export const toggleFavorite = async (workerId, isCurrentlyBookmarked) => {
  if (isCurrentlyBookmarked) {
    return await removeFavorite(workerId);
  } else {
    return await addFavorite(workerId);
  }
};

/**
 * Fetch all saved/favorite workers for logged-in user
 */
export const getFavorites = async () => {
  const response = await api.get(BASE_URL);
  return response.data; // Array of { _id, worker: {...}, createdAt }
};

/**
 * Check if a specific worker is bookmarked
 * @param {string} workerId
 */
export const isFavorited = async (workerId) => {
  const favorites = await getFavorites();
  return favorites.some((fav) => fav.worker._id === workerId);
};