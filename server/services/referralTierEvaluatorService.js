/**
 * Referral Reward Tier Evaluator Service
 */
export const evaluateReferralTier = (successfulReferralsCount) => {
  const count = Math.max(0, Number(successfulReferralsCount) || 0);

  if (count >= 20) {
    return { tier: 'PLATINUM', bonusPoints: 1000, discountPercent: 25, badge: 'COMMUNITY_AMBASSADOR' };
  } else if (count >= 10) {
    return { tier: 'GOLD', bonusPoints: 500, discountPercent: 15, badge: 'POWER_REFERRER' };
  } else if (count >= 5) {
    return { tier: 'SILVER', bonusPoints: 200, discountPercent: 10, badge: 'ACTIVE_REFERRER' };
  } else if (count >= 1) {
    return { tier: 'BRONZE', bonusPoints: 50, discountPercent: 5, badge: 'NOVICE_REFERRER' };
  }

  return { tier: 'NONE', bonusPoints: 0, discountPercent: 0, badge: null };
};

export const sanitizeReferralCode = (code = '') => {
  if (typeof code !== 'string') return '';
  return code.toUpperCase().replace(/[^A-Z0-9_-]/g, '').trim().slice(0, 20);
};
