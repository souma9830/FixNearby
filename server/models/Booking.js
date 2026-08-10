import mongoose from 'mongoose';

const STATUS_ENUM = ['Pending', 'Accepted', 'Reminder Sent', 'Technician En Route', 'In-Progress', 'Completed', 'Cancelled', 'Expired'];

const bookingSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    default: 'default_tenant',
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  service: {
    type: String,
    required: true,
    trim: true,
    maxlength: [120, 'Service must be less than 120 characters']
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  durationHours: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: STATUS_ENUM,
    default: 'Pending'
  },
  surgeMultiplier: {
    type: Number,
    default: 1.0
  },
  surgeAmount: {
    type: Number,
    default: 0
  },
  distanceFee: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  statusHistory: [{
    status: {
      type: String,
      enum: STATUS_ENUM
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.changedByModel'
    },
    changedByModel: {
      type: String,
      enum: ['User', 'Worker']
    },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now }
  }],
  // Escrow & Customer Approval tracking
  escrowStatus: {
    type: String,
    enum: ['not_applicable', 'held_in_escrow', 'released', 'disputed', 'refunded'],
    default: 'not_applicable'
  },
  completionApprovedByCustomer: {
    type: Boolean,
    default: false
  },
  customerApprovedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for common access patterns
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ workerId: 1, createdAt: -1 });
bookingSchema.index({ workerId: 1, status: 1 });
bookingSchema.index({ workerId: 1, scheduledTime: 1, status: 1 });
bookingSchema.index({ status: 1, scheduledTime: 1 });
bookingSchema.index({ reminderSent: 1, status: 1, scheduledTime: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
export { STATUS_ENUM };
