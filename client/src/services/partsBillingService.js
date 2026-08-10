import axios from 'axios';

const API_BASE = '/api/bookings/parts-inventory';

export const submitPartsInvoice = async (payload) => {
  const response = await axios.post(API_BASE, payload);
  return response.data;
};

export const setPartsApprovalStatus = async (bookingId, approvalStatus) => {
  const response = await axios.patch(`${API_BASE}/approval`, { bookingId, approvalStatus });
  return response.data;
};

export const fetchPartsForBooking = async (bookingId) => {
  const response = await axios.get(`${API_BASE}/booking/${bookingId}`);
  return response.data;
};

export const removePartsInvoice = async (bookingId) => {
  const response = await axios.delete(`${API_BASE}/booking/${bookingId}`);
  return response.data;
};
