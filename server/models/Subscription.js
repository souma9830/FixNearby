import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'subscriberModel'
  },
  subscriberModel: {
    type: String,
    enum: ['User', 'Worker'],
    required: true
  },
  planTier: {
    type: String,
    enum: ['free', 'customer_plus', 'worker_pro', 'worker_elite'],
    default: 'free'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due'],
    default: 'active'
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  perks: {
    zeroBookingFees: { type: Boolean, default: false },
    priorityDispatch: { type: Boolean, default: false },
    reducedCommissionPct: { type: Number, default: 10 },
    goldVerificationBadge: { type: Boolean, default: false }
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 3600 * 1000)
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ subscriberId: 1 });
subscriptionSchema.index({ planTier: 1, status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
