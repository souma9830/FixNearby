import axios from 'axios';

const API_BASE = '/api/subscriptions';

export const createRecurringSubscription = async (payload) => {
  const response = await axios.post(API_BASE, payload);
  return response.data;
};

export const fetchUserSubscriptions = async (customerId) => {
  const response = await axios.get(`${API_BASE}/customer/${customerId}`);
  return response.data;
};

export const setSubscriptionStatus = async (subscriptionId, status) => {
  const response = await axios.patch(`${API_BASE}/${subscriptionId}/status`, { status });
  return response.data;
};
