const CustomerTipBonus = require('../models/CustomerTipBonus');

exports.sendTipAndBonus = async (req, res) => {
  try {
    const { bookingId, workerId, tipAmount, performanceBonusAmount, note } = req.body;
    const tipRecord = await CustomerTipBonus.create({
      bookingId,
      customerId: req.user._id,
      workerId,
      tipAmount,
      performanceBonusAmount: performanceBonusAmount || 0,
      note
    });

    return res.status(201).json({ success: true, message: 'Tip and gratuity bonus recorded', data: tipRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWorkerTipHistory = async (req, res) => {
  try {
    const tips = await CustomerTipBonus.find({ workerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: tips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
