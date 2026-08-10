import ServiceDisputeEscalation from '../models/ServiceDisputeEscalation.js';

export const createDisputeEscalation = async (req, res, next) => {
  try {
    const { bookingId, workerId, reasonCategory, severity, claimAmount, evidenceUrls } = req.body;
    const userId = req.user.id;

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
    const userId = req.user.id;
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
    const { status, resolutionNotes } = req.body;

    const dispute = await ServiceDisputeEscalation.findByIdAndUpdate(
      disputeId,
      { status, resolutionNotes },
      { new: true, runValidators: true }
    );

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute escalation record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Dispute status updated',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

