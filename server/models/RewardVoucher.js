import mongoose from 'mongoose';

const rewardVoucherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  pointsCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'REDEEMED', 'EXPIRED'],
    default: 'ACTIVE',
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  redeemedAt: {
    type: Date
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

export default mongoose.model('RewardVoucher', rewardVoucherSchema);
