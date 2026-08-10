export const validatePartsInventoryPayload = (req, res, next) => {
  const { bookingId, items } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Items array is required and must contain at least 1 item.' });
  }

  for (const item of items) {
    if (!item.itemName || typeof item.itemName !== 'string') {
      return res.status(400).json({ success: false, message: 'Each item must have a valid name.' });
    }
    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      return res.status(400).json({ success: false, message: 'Item quantity must be at least 1.' });
    }
    if (typeof item.unitCostUSD !== 'number' || item.unitCostUSD <= 0) {
      return res.status(400).json({ success: false, message: 'Item unit cost must be greater than 0.' });
    }
  }

  next();
};
