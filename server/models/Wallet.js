import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['topup', 'payment', 'refund', 'cashback'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Wallet balance cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  transactions: [walletTransactionSchema]
}, {
  timestamps: true
});

walletSchema.index({ userId: 1 });

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
