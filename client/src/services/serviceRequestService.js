import api from "./apiClient";

export const createRequest = async (data) => {
  const res = await api.post('/service-requests', data);
  return res.data;
};

export const getMyRequests = async (params = {}) => {
  const res = await api.get('/service-requests/my', { params });
  return res.data;
};

export const getAllRequests = async (params = {}) => {
  const res = await api.get('/service-requests/all', { params });
  return res.data;
};

export const getRequestById = async (id) => {
  const res = await api.get(`/service-requests/${id}`);
  return res.data;
};

export const updateRequestStatus = async (id, data) => {
  const res = await api.patch(`/service-requests/${id}/status`, data);
  return res.data;
};

export const upvoteRequest = async (id) => {
  const res = await api.post(`/service-requests/${id}/upvote`);
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get('/service-requests/categories');
  return res.data;
};
