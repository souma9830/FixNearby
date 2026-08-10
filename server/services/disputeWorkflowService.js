/**
 * Service to handle dispute evidence validation and workflow state rules
 */
export const processDisputeEvidence = (urls = []) => {
  if (!Array.isArray(urls)) return { validUrls: [], rejectedCount: 0 };
  const validUrls = [];
  let rejectedCount = 0;

  for (const url of urls) {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      validUrls.push(url.trim());
    } else {
      rejectedCount++;
    }
  }

  return {
    validUrls,
    rejectedCount,
    totalReceived: urls.length
  };
};

export const validateClaimAmount = (amount, maxAllowed = 10000) => {
  const num = Number(amount);
  if (isNaN(num) || num < 0) return { valid: false, reason: 'Claim amount must be a positive number' };
  if (num > maxAllowed) return { valid: false, reason: `Claim amount exceeds maximum threshold of $${maxAllowed}` };
  return { valid: true, amount: num };
};
