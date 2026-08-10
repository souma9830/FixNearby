import api from './apiClient';

/**
 * Search workers with advanced filters
 * @param {Object} params - Search parameters
 * @returns {Promise} Search results
 */
export const searchWorkers = async (params) => {
  try {
    const response = await api.get('/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching workers:', error);
    throw error;
  }
};

/**
 * Get autocomplete suggestions
 * @param {string} query - Search query
 * @returns {Promise} Suggestions array
 */
export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data.suggestions || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

/**
 * Get popular searches
 * @returns {Promise} Popular searches array
 */
export const getPopularSearches = async () => {
  try {
    const response = await api.get('/search/popular');
    return response.data.popular || [];
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    return [];
  }
};

/**
 * Save search preset/template to backend
 * @param {string} name - Name of template
 * @param {string} query - Query string
 * @param {Object} filters - Filter fields
 */
export const saveSearchPreset = async (name, query, filters) => {
  try {
    const response = await api.post('/search/presets', { name, query, filters });
    return response.data;
  } catch (error) {
    console.error('Error saving search preset:', error);
    throw error;
  }
};

/**
 * Fetch all search presets for current user
 */
export const fetchSearchPresets = async () => {
  try {
    const response = await api.get('/search/presets');
    return response.data.presets || [];
  } catch (error) {
    console.error('Error fetching search presets:', error);
    throw error;
  }
};

/**
 * Delete a search preset
 * @param {string} id - Preset ID
 */
export const deleteSearchPreset = async (id) => {
  try {
    const response = await api.delete(`/search/presets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting search preset:', error);
    throw error;
  }
};
