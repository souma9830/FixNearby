export const validateWarrantyClaimPayload = (req, res, next) => {
  const { bookingId, originalWorkerId, claimDescription } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required.' });
  }

  if (!originalWorkerId) {
    return res.status(400).json({ success: false, message: 'Original worker ID is required.' });
  }

  if (!claimDescription || typeof claimDescription !== 'string' || claimDescription.trim().length < 15) {
    return res.status(400).json({ success: false, message: 'Claim description must be at least 15 characters.' });
  }

  next();
};
