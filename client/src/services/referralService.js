import api from './apiClient';

const normalizeError = (error, fallback) => ({
  message: error.response?.data?.message || error.response?.data?.error || fallback,
  status: error.response?.status,
});

/**
 * Send referral invitation via Email & SMS
 * @param {{ referredEmail: string, referredPhone?: string }} data 
 */
export const sendReferralInvite = async (data) => {
  try {
    const response = await api.post('/referrals/invite', data);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to send referral invitation');
  }
};

/**
 * Get user referral stats, shareable link, wallet credit balance, invites list, and worker milestone details
 */
export const getReferralStats = async () => {
  try {
    const response = await api.get('/referrals/stats');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch referral stats');
  }
};

/**
 * Claim pending referral reward
 * @param {string} referralId 
 */
export const claimReferralReward = async (referralId) => {
  try {
    const response = await api.post('/referrals/claim', { referralId });
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to claim referral reward');
  }
};

/**
 * Validate referral code (Public)
 * @param {string} code 
 */
export const validateReferralCode = async (code) => {
  try {
    const response = await api.get(`/referrals/validate/${code}`);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Invalid referral code');
  }
};

/**
 * Claim worker monthly job milestone bonus
 */
export const claimWorkerBonus = async () => {
  try {
    const response = await api.post('/referrals/worker-bonus/claim');
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to claim worker bonus');
  }
};

export default {
  sendReferralInvite,
  getReferralStats,
  claimReferralReward,
  validateReferralCode,
  claimWorkerBonus,
};
