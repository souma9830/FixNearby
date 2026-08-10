import apiClient from './apiClient';

export const updateGeofence = async (payload) => {
  const response = await apiClient.post('/geofence/update', payload);
  return response.data;
};

export const getWorkerGeofence = async (workerId) => {
  const response = await apiClient.get(`/geofence/${workerId}`);
  return response.data;
};

export const getMyGeofence = async () => {
  const response = await apiClient.get('/geofence/my-geofence');
  return response.data;
};

export default {
  updateGeofence,
  getWorkerGeofence,
  getMyGeofence
};
