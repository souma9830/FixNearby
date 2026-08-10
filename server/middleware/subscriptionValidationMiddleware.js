export const validateSubscriptionPayload = (req, res, next) => {
  const { workerId, serviceCategory, recurrenceFrequency, billingAmountPerCycle, startDate } = req.body;

  if (!workerId) {
    return res.status(400).json({ success: false, message: 'Worker ID is required.' });
  }

  if (!serviceCategory) {
    return res.status(400).json({ success: false, message: 'Service category is required.' });
  }

  const validFrequencies = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'];
  if (!recurrenceFrequency || !validFrequencies.includes(recurrenceFrequency)) {
    return res.status(400).json({
      success: false,
      message: `Invalid recurrence frequency. Allowed: ${validFrequencies.join(', ')}`,
    });
  }

  if (typeof billingAmountPerCycle !== 'number' || billingAmountPerCycle < 5) {
    return res.status(400).json({ success: false, message: 'Billing amount per cycle must be at least $5.' });
  }

  if (!startDate) {
    return res.status(400).json({ success: false, message: 'Start date is required.' });
  }

  next();
};
