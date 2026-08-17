import mongoose from 'mongoose';

const equipmentInventorySchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['PARTS', 'TOOLS', 'CONSUMABLES', 'HARDWARE'],
    default: 'PARTS'
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true
  },
  reorderThreshold: {
    type: Number,
    default: 5
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

export default mongoose.model('EquipmentInventory', equipmentInventorySchema);
