import DisputeEscalationService from '../services/disputeEscalationService.js';

export const fileDispute = async (req, res) => {
  try {
    const reporterId = req.user ? req.user.id : req.body.reporterId;
    const dispute = await DisputeEscalationService.createDispute({
      ...req.body,
      reporterId,
    });
    return res.status(201).json({
      success: true,
      message: 'Dispute escalation filed successfully.',
      data: dispute,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addEvidence = async (req, res) => {
  try {
    const submittedBy = req.user ? req.user.id : req.body.submittedBy;
    const dispute = await DisputeEscalationService.submitEvidence(req.params.disputeId, {
      ...req.body,
      submittedBy,
    });
    return res.status(200).json({
      success: true,
      message: 'Evidence attached to dispute escalation.',
      data: dispute,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const adminId = req.user ? req.user.id : req.body.adminId;
    const { decision, resolutionNotes } = req.body;
    const dispute = await DisputeEscalationService.resolveDispute(
      req.params.disputeId,
      adminId,
      decision,
      resolutionNotes
    );
    return res.status(200).json({
      success: true,
      message: 'Dispute escalation resolved.',
      data: dispute,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDisputes = async (req, res) => {
  try {
    const disputes = await DisputeEscalationService.getDisputesByBooking(req.params.bookingId);
    return res.status(200).json({
      success: true,
      data: disputes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDisputeById = async (req, res) => {
  try {
    const dispute = await DisputeEscalationService.getDisputeById(req.params.disputeId);
    return res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
