const mongoose = require('mongoose');

const serviceDisputeEscalationSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  againstUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reasonCategory: {
    type: String,
    enum: ['INCOMPLETE_WORK', 'DAMAGE_CLAIM', 'OVERCHARGED_FEE', 'UNPROFESSIONAL_BEHAVIOR', 'OTHER'],
    required: true
  },
  claimedRefundAmount: {
    type: Number,
    default: 0
  },
  disputeStatus: {
    type: String,
    enum: ['OPEN', 'UNDER_ARBITRATION', 'RESOLVED_REFUNDED', 'RESOLVED_REJECTED', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  arbitratorNotes: String,
  evidenceUrls: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceDisputeEscalation', serviceDisputeEscalationSchema);
