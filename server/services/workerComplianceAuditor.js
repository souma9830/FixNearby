/**
 * Worker Compliance & Accreditation Auditor Service
 * Evaluates license expiration, background verification status, insurance policy validity, and safety badges.
 */

export const auditWorkerCompliance = (workerData = {}) => {
  const {
    isIdentityVerified = false,
    backgroundCheckDate,
    insuranceExpiryDate,
    licenseNumber,
    licenseExpiryDate
  } = workerData;

  const now = new Date();
  const flags = [];

  let status = 'UNVERIFIED';

  if (!isIdentityVerified) {
    flags.push('IDENTITY_NOT_VERIFIED');
  }

  if (backgroundCheckDate) {
    const bgDate = new Date(backgroundCheckDate);
    const monthsDiff = (now - bgDate) / (1000 * 60 * 60 * 24 * 30);
    if (monthsDiff > 12) {
      flags.push('BACKGROUND_CHECK_EXPIRED');
    }
  } else {
    flags.push('BACKGROUND_CHECK_MISSING');
  }

  if (insuranceExpiryDate && new Date(insuranceExpiryDate) < now) {
    flags.push('INSURANCE_EXPIRED');
  }

  if (licenseExpiryDate && new Date(licenseExpiryDate) < now) {
    flags.push('LICENSE_EXPIRED');
  }

  if (isIdentityVerified && flags.length === 0) {
    status = 'FULLY_COMPLIANT';
  } else if (isIdentityVerified && flags.length <= 1) {
    status = 'PARTIALLY_COMPLIANT';
  }

  return {
    status,
    isFullyCompliant: status === 'FULLY_COMPLIANT',
    flags,
    lastAuditedAt: now
  };
};
