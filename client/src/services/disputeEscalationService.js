import axios from 'axios';

const API_BASE = '/api/disputes/escalations';

export const fileDisputeEscalation = async (disputeData) => {
  const response = await axios.post(API_BASE, disputeData);
  return response.data;
};

export const attachDisputeEvidence = async (disputeId, evidenceData) => {
  const response = await axios.post(`${API_BASE}/${disputeId}/evidence`, evidenceData);
  return response.data;
};

export const fetchDisputesForBooking = async (bookingId) => {
  const response = await axios.get(`${API_BASE}/booking/${bookingId}`);
  return response.data;
};

export const fetchDisputeById = async (disputeId) => {
  const response = await axios.get(`${API_BASE}/${disputeId}`);
  return response.data;
};

export const resolveDisputeEscalation = async (disputeId, decision, resolutionNotes) => {
  const response = await axios.patch(`${API_BASE}/${disputeId}/resolve`, { decision, resolutionNotes });
  return response.data;
};
