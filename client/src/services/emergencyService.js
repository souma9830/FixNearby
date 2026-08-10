import apiClient from './apiClient';

export const broadcastEmergencyAlert = async (alertData) => {
  const response = await apiClient.post('/emergency/broadcast', alertData);
  return response.data;
};

export const getActiveEmergencyAlerts = async () => {
  const response = await apiClient.get('/emergency/active');
  return response.data;
};

export const acceptEmergencyDispatch = async (alertId) => {
  const response = await apiClient.post(`/emergency/accept/${alertId}`);
  return response.data;
};

export default {
  broadcastEmergencyAlert,
  getActiveEmergencyAlerts,
  acceptEmergencyDispatch
};
