import axios from 'axios';

const API_BASE = '/api/workers/skills-certifications';

export const fetchWorkerSkills = async (workerId) => {
  const response = await axios.get(`${API_BASE}/worker/${workerId}`);
  return response.data;
};

export const submitSkillCertification = async (skillPayload) => {
  const response = await axios.post(API_BASE, skillPayload);
  return response.data;
};

export const auditExpiredSkills = async () => {
  const response = await axios.post(`${API_BASE}/audit-expired`);
  return response.data;
};

export const removeSkillCertification = async (skillId) => {
  const response = await axios.delete(`${API_BASE}/${skillId}`);
  return response.data;
};
