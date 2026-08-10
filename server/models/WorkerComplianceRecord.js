import mongoose from 'mongoose';

const workerComplianceRecordSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  insurancePolicyNumber: {
    type: String,
    required: true,
    trim: true,
  },
  insuranceProvider: {
    type: String,
    required: true,
    trim: true,
  },
  coverageAmountUSD: {
    type: Number,
    required: true,
    min: 50000,
  },
  insuranceExpirationDate: {
    type: Date,
    required: true,
  },
  backgroundCheckStatus: {
    type: String,
    enum: ['Not Started', 'Pending Review', 'Cleared', 'Failed'],
    default: 'Not Started',
  },
  backgroundCheckReferenceId: {
    type: String,
    trim: true,
  },
  complianceStatus: {
    type: String,
    enum: ['Fully Compliant', 'Action Required', 'Suspended'],
    default: 'Action Required',
    index: true,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('WorkerComplianceRecord', workerComplianceRecordSchema);
