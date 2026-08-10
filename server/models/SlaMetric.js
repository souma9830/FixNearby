const mongoose = require('mongoose');

const slaMetricSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expectedResponseTimeMinutes: {
    type: Number,
    default: 30
  },
  actualResponseTimeMinutes: {
    type: Number,
    required: true
  },
  expectedArrivalWindowMinutes: {
    type: Number,
    default: 60
  },
  actualArrivalDelayMinutes: {
    type: Number,
    default: 0
  },
  slaTier: {
    type: String,
    enum: ['STANDARD', 'PRIORITY', 'EMERGENCY_VIP'],
    default: 'STANDARD'
  },
  isSlaViolated: {
    type: Boolean,
    default: false,
    index: true
  },
  penaltyDeductionAmount: {
    type: Number,
    default: 0
  },
  resolutionStatus: {
    type: String,
    enum: ['MET', 'VIOLATED_PENDING_REVIEW', 'WAIVED_BY_CUSTOMER', 'PENALIZED'],
    default: 'MET'
  },
  violationReason: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SlaMetric', slaMetricSchema);
