const mongoose = require('mongoose');

const serviceWarrantySchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  warrantyDurationDays: {
    type: Number,
    default: 30
  },
  expiresAt: {
    type: Date,
    required: true
  },
  coverageTerms: {
    type: String,
    default: 'Free re-service fix within warranty period for labor issues.'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CLAIMED', 'EXPIRED'],
    default: 'ACTIVE',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceWarranty', serviceWarrantySchema);
