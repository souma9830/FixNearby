import api from "./apiClient";

/**
 * Fetch AI-powered smart worker recommendations.
 * @param {{ lat?: number, lng?: number, limit?: number }} params
 */
export const getRecommendations = async (params = {}) => {
  try {
    const response = await api.get("/recommendations", { params });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load smart recommendations",
      status: error.response?.status,
    };
  }
};

export default {
  getRecommendations,
};
