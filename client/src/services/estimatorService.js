import apiClient from './apiClient';

export const calculateEstimate = async (payload) => {
  const response = await apiClient.post('/estimator/calculate', payload);
  return response.data;
};

export default {
  calculateEstimate
};
