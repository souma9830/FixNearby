import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  platformFee: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['booking_income', 'payout_withdrawal', 'bonus', 'adjustment'],
    default: 'booking_income'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payoutDate: {
    type: Date
  },
  payoutMethod: {
    type: {
      type: String,
      enum: ['stripe_connect', 'bank_account', 'upi', 'bank_transfer', 'none'],
      default: 'none'
    },
    details: {
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      upiId: { type: String, default: '' },
      stripeAccountId: { type: String, default: '' }
    }
  },
  transactionId: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  transactionHistory: [{
    action: { type: String, required: true },
    amount: { type: Number },
    status: { type: String },
    method: { type: String },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

// Indexes for common queries
earningSchema.index({ workerId: 1, createdAt: -1 });
earningSchema.index({ status: 1 });
earningSchema.index({ workerId: 1, status: 1, createdAt: -1 });
earningSchema.index({ workerId: 1, type: 1 });

const Earning = mongoose.model('Earning', earningSchema);
export default Earning;
