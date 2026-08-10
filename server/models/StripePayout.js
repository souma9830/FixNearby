import mongoose from 'mongoose';

const stripePayoutSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  stripeAccountId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP'],
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    default: 1.0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'processing'
  },
  stripePayoutId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const StripePayout = mongoose.model('StripePayout', stripePayoutSchema);
export default StripePayout;
