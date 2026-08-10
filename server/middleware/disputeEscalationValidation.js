export const validateDisputeFiling = (req, res, next) => {
  const { bookingId, disputeReason, claimAmountRequested, detailedStatement } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required.' });
  }

  const validReasons = ['Incomplete Work', 'Property Damage', 'Unsatisfactory Quality', 'Billing Discrepancy', 'No Show', 'Safety Violation'];
  if (!disputeReason || !validReasons.includes(disputeReason)) {
    return res.status(400).json({
      success: false,
      message: `Invalid dispute reason. Allowed values: ${validReasons.join(', ')}`,
    });
  }

  if (typeof claimAmountRequested !== 'number' || claimAmountRequested < 0) {
    return res.status(400).json({
      success: false,
      message: 'Claim amount requested must be a non-negative number.',
    });
  }

  if (!detailedStatement || typeof detailedStatement !== 'string' || detailedStatement.trim().length < 20) {
    return res.status(400).json({
      success: false,
      message: 'Detailed statement is required and must be at least 20 characters.',
    });
  }

  next();
};
