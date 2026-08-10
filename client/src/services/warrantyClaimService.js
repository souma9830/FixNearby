import axios from 'axios';

const API_BASE = '/api/warranties/claims';

export const submitWarrantyClaim = async (payload) => {
  const response = await axios.post(`${API_BASE}/file`, payload);
  return response.data;
};

export const fetchUserWarrantyClaims = async (customerId) => {
  const response = await axios.get(`${API_BASE}/customer/${customerId}`);
  return response.data;
};

export const fetchWarrantyClaimById = async (claimId) => {
  const response = await axios.get(`${API_BASE}/${claimId}`);
  return response.data;
};

export const resolveWarrantyClaim = async (claimId, resolutionSummary, status) => {
  const response = await axios.patch(`${API_BASE}/${claimId}/resolve`, { resolutionSummary, status });
  return response.data;
};
