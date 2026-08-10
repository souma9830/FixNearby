import apiClient from './apiClient';

export const getPayoutDetails = async () => {
  const response = await apiClient.get('/payouts/details');
  return response.data;
};

export const createConnectAccount = async () => {
  const response = await apiClient.post('/payouts/stripe-connect');
  return response.data;
};

export const requestPayout = async (amount) => {
  const response = await apiClient.post('/payouts/request', { amount });
  return response.data;
};

export default {
  getPayoutDetails,
  createConnectAccount,
  requestPayout
};
