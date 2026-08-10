/**
 * Wallet transaction and amount verification engine
 */
export const validateWalletAmount = (amount, min = 1, max = 5000) => {
  const num = Number(amount);
  if (isNaN(num)) return { valid: false, reason: 'Amount must be a numeric value' };
  if (num < min) return { valid: false, reason: `Amount must be at least $${min}` };
  if (num > max) return { valid: false, reason: `Amount cannot exceed maximum threshold of $${max}` };
  return { valid: true, amount: num };
};

export const sanitizeWalletDescription = (desc = '') => {
  if (typeof desc !== 'string') return '';
  return desc.replace(/[<>{}]/g, '').trim().slice(0, 200);
};
