export const validateCompliancePayload = (req, res, next) => {
  const { insurancePolicyNumber, insuranceProvider, coverageAmountUSD, insuranceExpirationDate } = req.body;

  if (!insurancePolicyNumber || typeof insurancePolicyNumber !== 'string' || insurancePolicyNumber.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Valid insurance policy number required.' });
  }

  if (!insuranceProvider || typeof insuranceProvider !== 'string' || insuranceProvider.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Insurance provider name required.' });
  }

  if (typeof coverageAmountUSD !== 'number' || coverageAmountUSD < 50000) {
    return res.status(400).json({ success: false, message: 'Minimum policy coverage must be at least $50,000.' });
  }

  if (!insuranceExpirationDate) {
    return res.status(400).json({ success: false, message: 'Insurance expiration date required.' });
  }

  next();
};
