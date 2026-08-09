const mongoose = require('mongoose');

const customerTipBonusSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  tipAmount: {
    type: Number,
    required: true,
    min: 0
  },
  performanceBonusAmount: {
    type: Number,
    default: 0
  },
  payoutStatus: {
    type: String,
    enum: ['PENDING_PAYOUT', 'COMPLETED', 'FAILED'],
    default: 'PENDING_PAYOUT'
  },
  note: String
}, {
  timestamps: true
});

module.exports = mongoose.model('CustomerTipBonus', customerTipBonusSchema);
