import api from './apiClient';

export const submitReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || 'Failed to submit review',
      status: error.response?.status
    };
  }
};

export const fetchWorkerReviews = async (workerId) => {
  try {
    const response = await api.get(`/reviews/worker/${workerId}`);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || 'Failed to fetch reviews',
      status: error.response?.status
    };
  }
};

export default {
  submitReview,
  fetchWorkerReviews
};
