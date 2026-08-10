import axios from 'axios';

const API_BASE = '/api/bookings/gratuity-bonus';

export const submitPostJobTip = async (payload) => {
  const response = await axios.post(`${API_BASE}/tip`, payload);
  return response.data;
};

export const fetchWorkerTipEarnings = async (workerId) => {
  const response = await axios.get(`${API_BASE}/worker-summary/${workerId}`);
  return response.data;
};

export const fetchGratuityById = async (gratuityId) => {
  const response = await axios.get(`${API_BASE}/${gratuityId}`);
  return response.data;
};
