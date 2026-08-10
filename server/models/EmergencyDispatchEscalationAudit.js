import mongoose from 'mongoose';

const emergencyDispatchEscalationAuditSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyDispatchTicket',
      required: true,
      index: true,
    },
    escalationLevel: {
      type: Number,
      default: 1, // Level 1 (5km), Level 2 (15km), Level 3 (30km broadcast)
    },
    notifiedWorkerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
      },
    ],
    broadcastRadiusKm: {
      type: Number,
      required: true,
    },
    escalationTriggerReason: {
      type: String,
      default: 'No worker accepted within initial SLA window (3 mins)',
    },
  },
  { timestamps: true }
);

const EmergencyDispatchEscalationAudit = mongoose.model('EmergencyDispatchEscalationAudit', emergencyDispatchEscalationAuditSchema);
export default EmergencyDispatchEscalationAudit;
