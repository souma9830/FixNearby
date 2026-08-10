import mongoose from 'mongoose';

const priceMatrixSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true
    },
    baseRate: {
      type: Number,
      required: true
    },
    hourlyRate: {
      type: Number,
      required: true
    },
    urgencyMultipliers: {
      standard: { type: Number, default: 1.0 },
      same_day: { type: Number, default: 1.25 },
      emergency: { type: Number, default: 1.5 }
    },
    complexityMultipliers: {
      low: { type: Number, default: 1.0 },
      medium: { type: Number, default: 1.3 },
      high: { type: Number, default: 1.75 }
    },
    defaultMaterialsEstimate: {
      type: Number,
      default: 25
    }
  },
  { timestamps: true }
);

export default mongoose.model('PriceMatrix', priceMatrixSchema);
