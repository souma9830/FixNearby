import axios from 'axios';

const API_BASE = '/api/workers/service-zones';

export const addWorkerServiceZone = async (zonePayload) => {
  const response = await axios.post(API_BASE, zonePayload);
  return response.data;
};

export const fetchWorkerServiceZones = async (workerId) => {
  const response = await axios.get(`${API_BASE}/worker/${workerId}`);
  return response.data;
};

export const checkWorkerCoverage = async (workerId, lat, lon) => {
  const response = await axios.get(`${API_BASE}/check-coverage?workerId=${workerId}&lat=${lat}&lon=${lon}`);
  return response.data;
};
