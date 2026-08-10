import api from "./apiClient";

const BASE_URL = "/estimates";

/**
 * Preview estimate based on inputs
 * @param {string} workerId
 * @param {object} inputs
 */
export const previewEstimate = async (workerId, inputs) => {
  const response = await api.post(`${BASE_URL}/preview`, { workerId, inputs });
  return response.data; // { success, profession, inputs, breakdown }
};

export const confirmEstimate = async (workerId, inputs) => {
  const response = await api.post(`${BASE_URL}/confirm`, { workerId, inputs });
  return response.data; // { success, message, estimate }
};

export const getDynamicPricingEstimate = async (payload) => {
  const response = await api.post('/pricing/estimate', payload);
  return response.data;
};

export const fetchPriceMatrices = async () => {
  const response = await api.get('/pricing/matrix');
  return response.data;
};
