/**
 * Badge Accreditation Verifier Service
 */
export const verifyBadgeEligibility = (completedJobsCount, averageRating, backgroundChecked) => {
  const jobs = Number(completedJobsCount) || 0;
  const rating = Number(averageRating) || 0;

  const eligibleBadges = [];

  if (backgroundChecked) {
    eligibleBadges.push('VERIFIED_BACKGROUND');
  }

  if (jobs >= 50 && rating >= 4.8) {
    eligibleBadges.push('TOP_RATED_PRO');
  } else if (jobs >= 20 && rating >= 4.5) {
    eligibleBadges.push('COMMUNITY_TRUSTED');
  }

  if (jobs >= 10) {
    eligibleBadges.push('EXPERIENCED_PROVIDER');
  }

  return {
    isEligible: eligibleBadges.length > 0,
    eligibleBadges,
    nextThreshold: jobs < 20 ? `${20 - jobs} more completed jobs required for COMMUNITY_TRUSTED` : null
  };
};

export const sanitizeBadgeRequestPayload = (badgeType, notes = '') => {
  const allowedBadges = ['VERIFIED_BACKGROUND', 'TOP_RATED_PRO', 'COMMUNITY_TRUSTED', 'EXPERIENCED_PROVIDER', 'INSURED_LICENSE'];
  const isValidBadge = allowedBadges.includes(badgeType);

  return {
    valid: isValidBadge,
    badgeType: isValidBadge ? badgeType : null,
    notes: typeof notes === 'string' ? notes.replace(/[<>{}]/g, '').trim().slice(0, 300) : ''
  };
};
