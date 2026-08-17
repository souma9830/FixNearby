import ServiceWarranty from '../models/ServiceWarranty.js';

export const issueWarranty = async (req, res) => {
  try {
    const { bookingId, workerId, warrantyDurationDays = 30, coverageTerms } = req.body;
    const expiresAt = new Date(Date.now() + warrantyDurationDays * 24 * 60 * 60 * 1000);

    const warranty = await ServiceWarranty.create({
      bookingId,
      customerId: req.user._id,
      workerId,
      warrantyDurationDays,
      expiresAt,
      coverageTerms
    });

    return res.status(201).json({ success: true, message: 'Service warranty guarantee issued', data: warranty });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserWarranties = async (req, res) => {
  try {
    const warranties = await ServiceWarranty.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: warranties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
