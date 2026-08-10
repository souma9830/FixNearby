import api from "./apiClient";

export const createPaymentIntent = async (data) => {
  const res = await api.post('/payments/create-intent', data);
  return res.data;
};

export const confirmPayment = async (data) => {
  const res = await api.post('/payments/confirm', data);
  return res.data;
};

export const getPaymentHistory = async (params = {}) => {
  const res = await api.get('/payments/history', { params });
  return res.data;
};

export const getPaymentById = async (id) => {
  const res = await api.get(`/payments/${id}`);
  return res.data;
};

export const requestRefund = async (id, reason) => {
  const res = await api.post(`/payments/${id}/refund`, { reason });
  return res.data;
};
