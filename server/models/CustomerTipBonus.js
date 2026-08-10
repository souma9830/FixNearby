import mongoose from 'mongoose';

const customerTipBonusSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    tipAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    bonusType: {
      type: String,
      enum: ['standard_tip', 'exemplary_service_bonus', 'emergency_response_tip'],
      default: 'standard_tip',
    },
    customerMessage: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'succeeded',
    },
  },
  { timestamps: true }
);

const CustomerTipBonus = mongoose.model('CustomerTipBonus', customerTipBonusSchema);
export default CustomerTipBonus;
