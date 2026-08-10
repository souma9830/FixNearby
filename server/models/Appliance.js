import mongoose from 'mongoose';

const applianceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applianceName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['HVAC', 'Plumbing', 'Electrical', 'Appliance', 'General'],
    default: 'HVAC'
  },
  modelNumber: {
    type: String,
    default: ''
  },
  installDate: {
    type: Date,
    default: Date.now
  },
  lastServicedAt: {
    type: Date,
    default: Date.now
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 95
  },
  predictedFailureDate: {
    type: Date,
    default: () => new Date(Date.now() + 180 * 24 * 3600 * 1000)
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

applianceSchema.index({ userId: 1 });

const Appliance = mongoose.model('Appliance', applianceSchema);
export default Appliance;
