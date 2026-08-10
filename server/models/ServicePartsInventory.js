import mongoose from 'mongoose';

const partItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCostUSD: {
    type: Number,
    required: true,
    min: 0.1,
  },
  markupPercentage: {
    type: Number,
    default: 10, // 10% standard parts markup
  },
});

const servicePartsInventorySchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [partItemSchema],
  totalMaterialCostUSD: {
    type: Number,
    required: true,
    min: 0,
  },
  approvalStatus: {
    type: String,
    enum: ['Draft', 'Pending Customer Approval', 'Approved', 'Rejected'],
    default: 'Draft',
    index: true,
  },
  receiptUrl: {
    type: String,
    default: null,
  },
  supplierNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
});

export default mongoose.model('ServicePartsInventory', servicePartsInventorySchema);
