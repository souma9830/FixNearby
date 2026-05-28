import api from './apiClient';

// Worker updates their status (requires auth via apiClient interceptor)
export const updateAvailabilityStatus = async (status) => {
  const res = await api.put(
    '/api/availability/status',
    { availabilityStatus: status }
  );
  return res.data;
};

// Fetch a worker's status (public — no auth required)
export const getWorkerStatus = async (workerId) => {
  const res = await api.get(`/api/availability/status/${workerId}`);
  return res.data;
};