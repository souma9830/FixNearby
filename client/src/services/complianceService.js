import axios from 'axios';

const API_BASE = '/api/workers/compliance';

export const submitWorkerInsurance = async (payload) => {
  const response = await axios.post(`${API_BASE}/insurance`, payload);
  return response.data;
};

export const fetchWorkerComplianceRecord = async (workerId) => {
  const response = await axios.get(`${API_BASE}/worker/${workerId}`);
  return response.data;
};
