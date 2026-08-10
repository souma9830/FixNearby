import mongoose from 'mongoose';

const quoteNegotiationSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
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
  },
  proposedPrice: {
    type: Number,
    required: true,
    min: 1,
  },
  originalEstimate: {
    type: Number,
    required: true,
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customScopeTerms: {
    type: String,
    required: true,
    trim: true,
  },
  quoteStatus: {
    type: String,
    enum: ['Pending Counter', 'Accepted', 'Declined', 'Expired'],
    default: 'Pending Counter',
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('QuoteNegotiation', quoteNegotiationSchema);
