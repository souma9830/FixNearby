import mongoose from 'mongoose';

const serviceSubscriptionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceCategory: {
    type: String,
    required: true,
  },
  recurrenceFrequency: {
    type: String,
    enum: ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'],
    required: true,
  },
  billingAmountPerCycle: {
    type: Number,
    required: true,
    min: 5,
  },
  nextBookingDate: {
    type: Date,
    required: true,
    index: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ['Active', 'Paused', 'Canceled'],
    default: 'Active',
    index: true,
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('ServiceSubscription', serviceSubscriptionSchema);
