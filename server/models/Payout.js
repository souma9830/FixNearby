import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'usd'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    stripeTransferId: {
      type: String
    },
    failureReason: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Payout', payoutSchema);
