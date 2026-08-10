import BookingDisputeEscalation from '../models/BookingDisputeEscalation.js';

class DisputeEscalationService {
  static async createDispute(payload) {
    const existing = await BookingDisputeEscalation.findOne({
      bookingId: payload.bookingId,
      escalationStatus: { $nin: ['Resolved Refunded', 'Resolved Released', 'Dismissed'] },
    });

    if (existing) {
      throw new Error('An active dispute escalation is already in progress for this booking.');
    }

    const dispute = new BookingDisputeEscalation({
      bookingId: payload.bookingId,
      reporterId: payload.reporterId,
      respondentId: payload.respondentId,
      disputeReason: payload.disputeReason,
      claimAmountRequested: payload.claimAmountRequested,
      detailedStatement: payload.detailedStatement,
      escalationStatus: 'Filed',
    });

    return await dispute.save();
  }

  static async submitEvidence(disputeId, evidenceData) {
    const dispute = await BookingDisputeEscalation.findById(disputeId);
    if (!dispute) {
      throw new Error('Dispute escalation record not found');
    }

    dispute.evidenceList.push(evidenceData);
    dispute.escalationStatus = 'Under Review';
    return await dispute.save();
  }

  static async resolveDispute(disputeId, adminId, decision, resolutionNotes) {
    const dispute = await BookingDisputeEscalation.findById(disputeId);
    if (!dispute) {
      throw new Error('Dispute escalation record not found');
    }

    const validDecisions = ['Resolved Refunded', 'Resolved Released', 'Dismissed'];
    if (!validDecisions.includes(decision)) {
      throw new Error('Invalid resolution decision');
    }

    dispute.escalationStatus = decision;
    dispute.resolvedByAdminId = adminId;
    dispute.resolutionNotes = resolutionNotes;
    dispute.resolvedAt = new Date();

    return await dispute.save();
  }

  static async getDisputesByBooking(bookingId) {
    return await BookingDisputeEscalation.find({ bookingId }).sort({ createdAt: -1 });
  }
}

export default DisputeEscalationService;
