import mongoose from 'mongoose';

const workerSlaComplianceSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    periodMonth: {
      type: String,
      required: true, // e.g. "2026-08"
    },
    onTimeArrivalRate: {
      type: Number,
      default: 100,
    },
    jobCompletionRate: {
      type: Number,
      default: 100,
    },
    averageResponseTimeMinutes: {
      type: Number,
      default: 15,
    },
    slaViolationsCount: {
      type: Number,
      default: 0,
    },
    slaStatus: {
      type: String,
      enum: ['compliant', 'warning', 'breached'],
      default: 'compliant',
    },
  },
  { timestamps: true }
);

const WorkerSlaCompliance = mongoose.model('WorkerSlaCompliance', workerSlaComplianceSchema);
export default WorkerSlaCompliance;
