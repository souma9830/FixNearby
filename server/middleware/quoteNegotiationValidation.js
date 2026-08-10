export const validateQuotePayload = (req, res, next) => {
  const { proposedPrice, originalEstimate, customScopeTerms } = req.body;

  if (typeof proposedPrice !== 'number' || proposedPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Proposed price must be greater than zero.' });
  }

  if (typeof originalEstimate !== 'number' || originalEstimate <= 0) {
    return res.status(400).json({ success: false, message: 'Original estimate must be greater than zero.' });
  }

  if (!customScopeTerms || typeof customScopeTerms !== 'string' || customScopeTerms.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Custom scope terms must be at least 5 characters.' });
  }

  next();
};
