import mongoose from 'mongoose';

const workerGratuityBonusSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tipAmountUSD: {
    type: Number,
    required: true,
    min: 1,
  },
  platformBonusMatchUSD: {
    type: Number,
    default: 0,
  },
  totalPayoutAmountUSD: {
    type: Number,
    required: true,
  },
  complimentTags: [{
    type: String,
    enum: ['Punctual', 'Clean Work', 'Polite', 'Expert Skill', 'Above & Beyond'],
  }],
  payoutStatus: {
    type: String,
    enum: ['Pending Transfer', 'Transferred', 'Failed'],
    default: 'Pending Transfer',
    index: true,
  },
  customerNote: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'Wallet', 'ApplePay'],
    default: 'Card'
  }
}, {
  timestamps: true,
});

export default mongoose.model('WorkerGratuityBonus', workerGratuityBonusSchema);
