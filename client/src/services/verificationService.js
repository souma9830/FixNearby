import api from "./apiClient";

const normalizeError = (error, fallback) => ({
  message: error.response?.data?.message || error.response?.data?.error || fallback,
  status: error.response?.status,
});

export const submitVerification = async (formData) => {
  try {
    const response = await api.post('/verification/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to submit verification');
  }
};

export const getVerificationStatus = async () => {
  try {
    const response = await api.get('/verification/status');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch verification status');
  }
};

export const getPendingVerifications = async (params = {}) => {
  try {
    const response = await api.get('/verification/pending', { params });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch pending verifications');
  }
};

export const approveVerification = async (id, notes) => {
  try {
    const response = await api.patch(`/verification/${id}/approve`, { adminNotes: notes });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to approve verification');
  }
};

export const rejectVerification = async (id, reason) => {
  try {
    const response = await api.patch(`/verification/${id}/reject`, { rejectionReason: reason });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to reject verification');
  }
};

export const getVerificationStats = async () => {
  try {
    const response = await api.get('/verification/stats');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch verification stats');
  }
};

export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post('/verification/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to upload document');
  }
};

export default {
  submitVerification,
  getVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationStats,
  uploadDocument,
};
