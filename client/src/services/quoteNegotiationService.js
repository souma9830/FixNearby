import axios from 'axios';

const API_BASE = '/api/chat/quote-negotiation';

export const createQuoteCounterOffer = async (payload) => {
  const response = await axios.post(API_BASE, payload);
  return response.data;
};

export const respondToQuoteOffer = async (quoteId, action) => {
  const response = await axios.patch(`${API_BASE}/${quoteId}/respond`, { action });
  return response.data;
};

export const fetchQuotesForChat = async (chatId) => {
  const response = await axios.get(`${API_BASE}/chat/${chatId}`);
  return response.data;
};
