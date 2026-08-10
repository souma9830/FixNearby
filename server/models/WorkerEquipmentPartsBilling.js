import mongoose from 'mongoose';

const workerEquipmentPartsBillingSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    partsUsed: [
      {
        partName: { type: String, required: true },
        partNumber: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        markupPercentage: { type: Number, default: 10 },
      },
    ],
    subtotalPartsCost: {
      type: Number,
      required: true,
      default: 0,
    },
    billingStatus: {
      type: String,
      enum: ['draft', 'submitted', 'approved_by_customer', 'paid'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

const WorkerEquipmentPartsBilling = mongoose.model(
  'WorkerEquipmentPartsBilling',
  workerEquipmentPartsBillingSchema
);
export default WorkerEquipmentPartsBilling;
