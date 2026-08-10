export const validateGratuityPayload = (req, res, next) => {
  const { bookingId, tipAmountUSD } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required.' });
  }

  if (typeof tipAmountUSD !== 'number' || tipAmountUSD < 1) {
    return res.status(400).json({ success: false, message: 'Tip amount must be at least $1.' });
  }

  next();
};
