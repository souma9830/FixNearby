import apiClient from './apiClient';

export const geofencedCheckIn = async (bookingId, coordinates) => {
  const response = await apiClient.post('/telemetry/check-in', { bookingId, coordinates });
  return response.data;
};

export const geofencedCheckOut = async (bookingId, coordinates) => {
  const response = await apiClient.post('/telemetry/check-out', { bookingId, coordinates });
  return response.data;
};

export const getBookingTelemetry = async (bookingId) => {
  const response = await apiClient.get(`/telemetry/${bookingId}`);
  return response.data;
};

export default {
  geofencedCheckIn,
  geofencedCheckOut,
  getBookingTelemetry
};
