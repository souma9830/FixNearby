const ServiceDisputeEscalation = require('../models/ServiceDisputeEscalation');

exports.fileDisputeEscalation = async (req, res) => {
  try {
    const { bookingId, againstUser, reasonCategory, claimedRefundAmount, evidenceUrls } = req.body;
    const escalation = await ServiceDisputeEscalation.create({
      bookingId,
      raisedBy: req.user._id,
      againstUser,
      reasonCategory,
      claimedRefundAmount,
      evidenceUrls
    });

    return res.status(201).json({
      success: true,
      message: 'Dispute escalation ticket successfully registered for moderation review',
      data: escalation
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDisputeEscalations = async (req, res) => {
  try {
    const escalations = await ServiceDisputeEscalation.find({ raisedBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: escalations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
