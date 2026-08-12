import ServiceDisputeEscalation from '../models/ServiceDisputeEscalation.js';
import DisputeArbitrationAudit from '../models/DisputeArbitrationAudit.js';

export const createDisputeEscalation = async (req, res, next) => {
  try {
    const { bookingId, workerId, reasonCategory, severity, claimAmount, evidenceUrls } = req.body;
    const userId = req.user._id || req.user.id;

    const newDispute = await ServiceDisputeEscalation.create({
      bookingId,
      userId,
      workerId,
      reasonCategory,
      severity,
      claimAmount,
      evidenceUrls,
    });

    res.status(201).json({
      success: true,
      message: 'Dispute escalation filed successfully',
      data: newDispute,
    });
  } catch (error) {
    next(error);
  }
};

export const getDisputeEscalations = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const disputes = await ServiceDisputeEscalation.find({
      $or: [{ userId }, { workerId: userId }],
    })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDisputeStatus = async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { status, resolutionNotes, refundAmountApproved } = req.body;

    const existingDispute = await ServiceDisputeEscalation.findById(disputeId);
    if (!existingDispute) {
      return res.status(404).json({ success: false, message: 'Dispute escalation record not found' });
    }

    const previousStatus = existingDispute.status;
    existingDispute.status = status || existingDispute.status;
    existingDispute.resolutionNotes = resolutionNotes || existingDispute.resolutionNotes;
    await existingDispute.save();

    await DisputeArbitrationAudit.create({
      disputeId: existingDispute._id,
      arbitratorId: req.user._id || req.user.id,
      previousStatus,
      newStatus: existingDispute.status,
      refundAmountApproved: refundAmountApproved || 0,
      arbitrationNotes: resolutionNotes || `Arbitration decision updated status from ${previousStatus} to ${existingDispute.status}`,
    });

    res.status(200).json({
      success: true,
      message: 'Dispute status updated and arbitration audit logged',
      data: existingDispute,
    });
  } catch (error) {
    next(error);
  }
};


