import apiClient from './apiClient';

export const getWorkerAvailability = async (workerId) => {
  const response = await apiClient.get(`/calendar/availability/${workerId}`);
  return response.data;
};

export const addAvailabilitySlot = async (slotData) => {
  const response = await apiClient.post('/calendar/availability/slot', slotData);
  return response.data;
};

export const removeAvailabilitySlot = async (slotId) => {
  const response = await apiClient.delete(`/calendar/availability/slot/${slotId}`);
  return response.data;
};

export const checkSlotAvailability = async (workerId, date, time) => {
  const response = await apiClient.get(`/calendar/check`, {
    params: { workerId, date, time }
  });
  return response.data;
};

export const updateCalendarSettings = async (settings) => {
  const response = await apiClient.put('/calendar/settings', settings);
  return response.data;
};

export default {
  getWorkerAvailability,
  addAvailabilitySlot,
  removeAvailabilitySlot,
  checkSlotAvailability,
  updateCalendarSettings
};
