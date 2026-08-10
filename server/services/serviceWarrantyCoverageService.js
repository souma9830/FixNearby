/**
 * Service Warranty Coverage Verifier Service
 */
export const verifyWarrantyCoverage = (completionDate, warrantyDays = 30) => {
  const compDate = new Date(completionDate);
  if (isNaN(compDate.getTime())) {
    return { valid: false, reason: 'Invalid completion date format' };
  }

  const now = new Date();
  const warrantyExpirationDate = new Date(compDate.getTime() + warrantyDays * 24 * 3600 * 1000);
  const isCovered = now <= warrantyExpirationDate;
  const daysRemaining = Math.max(0, Math.ceil((warrantyExpirationDate.getTime() - now.getTime()) / (24 * 3600 * 1000)));

  return {
    valid: true,
    isCovered,
    daysRemaining,
    warrantyDays,
    expirationDate: warrantyExpirationDate.toISOString()
  };
};

export const sanitizeWarrantyClaimPayload = (claimNotes = '') => {
  if (typeof claimNotes !== 'string') return '';
  return claimNotes.replace(/[<>{}]/g, '').trim().slice(0, 500);
};
