import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referrerModel',
    required: true
  },
  referrerModel: {
    type: String,
    enum: ['User', 'Worker'],
    default: 'User'
  },
  referralCode: {
    type: String,
    required: true,
    index: true
  },
  referredEmail: {
    type: String,
    required: [true, 'Referred email is required'],
    lowercase: true,
    trim: true
  },
  referredPhone: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'joined', 'credited'],
    default: 'pending'
  },
  rewardAmount: {
    type: Number,
    default: 500 // ₹500 referral credit
  },
  utmSource: {
    type: String,
    default: 'fixnearby'
  },
  utmMedium: {
    type: String,
    default: 'referral_program'
  },
  utmCampaign: {
    type: String,
    default: 'invite_friends'
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  creditedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

referralSchema.index({ referrerId: 1, referredEmail: 1 }, { unique: true });
referralSchema.index({ referralCode: 1, status: 1 });
referralSchema.index({ referredEmail: 1, status: 1 });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
