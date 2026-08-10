import api from "./apiClient";

/**
 * Fetch reported reviews awaiting moderation.
 * @param {{ page?: number, limit?: number }} params
 */
export const getReportedReviews = async (params = {}) => {
  try {
    const response = await api.get("/admin/moderation/reviews", { params });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load reported reviews",
      status: error.response?.status,
    };
  }
};

/**
 * Approve a single review.
 * @param {string} id
 */
export const approveReview = async (id) => {
  try {
    const response = await api.patch(`/admin/moderation/reviews/${id}/approve`);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to approve review",
      status: error.response?.status,
    };
  }
};

/**
 * Reject/flag a single review.
 * @param {string} id
 * @param {string} [adminNote]
 */
export const rejectReview = async (id, adminNote) => {
  try {
    const response = await api.patch(`/admin/moderation/reviews/${id}/reject`, { adminNote });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to flag review",
      status: error.response?.status,
    };
  }
};

/**
 * Bulk approve or reject reviews.
 * @param {string[]} ids
 * @param {"approve"|"reject"} action
 */
export const bulkAction = async (ids, action) => {
  try {
    const response = await api.post("/admin/moderation/reviews/bulk", {
      reviewIds: ids,
      action,
    });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Bulk action failed",
      status: error.response?.status,
    };
  }
};

/**
 * Get moderation dashboard stats.
 */
export const getModerationStats = async () => {
  try {
    const response = await api.get("/admin/moderation/stats");
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load moderation stats",
      status: error.response?.status,
    };
  }
};

export default {
  getReportedReviews,
  approveReview,
  rejectReview,
  bulkAction,
  getModerationStats,
};
