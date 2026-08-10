import mongoose from 'mongoose';

const partsInventoryReorderLogSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    partName: {
      type: String,
      required: true,
    },
    partNumber: {
      type: String,
      required: true,
    },
    currentStockLevel: {
      type: Number,
      required: true,
    },
    reorderThreshold: {
      type: Number,
      default: 5,
    },
    recommendedRestockQty: {
      type: Number,
      default: 20,
    },
    autoReorderTriggered: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PartsInventoryReorderLog = mongoose.model('PartsInventoryReorderLog', partsInventoryReorderLogSchema);
export default PartsInventoryReorderLog;
