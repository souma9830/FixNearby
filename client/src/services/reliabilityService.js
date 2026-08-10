import axios from 'axios';

const API_BASE = '/api/workers/reliability';

export const fetchReliabilityScore = async (workerId) => {
  const response = await axios.get(`${API_BASE}/worker/${workerId}`);
  return response.data;
};

export const submitCancellationPenalty = async (payload) => {
  const response = await axios.post(`${API_BASE}/penalty`, payload);
  return response.data;
};
