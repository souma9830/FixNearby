import mongoose from 'mongoose';

const workerSlaPenaltyAuditSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    violationType: {
      type: String,
      enum: ['LATE_ARRIVAL', 'MISSED_RESPONSE_SLA', 'UNEXCUSED_CANCELLATION', 'JOB_ABANDONMENT'],
      required: true,
    },
    penaltyDeductionAmount: {
      type: Number,
      default: 0,
    },
    slaTierImpact: {
      type: String,
      enum: ['compliant', 'warning', 'breached'],
      default: 'warning',
    },
  },
  { timestamps: true }
);

const WorkerSlaPenaltyAudit = mongoose.model('WorkerSlaPenaltyAudit', workerSlaPenaltyAuditSchema);
export default WorkerSlaPenaltyAudit;
