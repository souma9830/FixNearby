import mongoose from 'mongoose';

const damageAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  detectedCategory: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'General'],
    default: 'Plumbing'
  },
  severityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  detectedIssues: [{
    name: { type: String, required: true },
    confidencePct: { type: Number, default: 92 },
    description: { type: String }
  }],
  estimatedLaborHours: {
    type: Number,
    default: 2.5
  },
  estimatedTotalCost: {
    type: Number,
    default: 150
  },
  billOfMaterials: [{
    item: { type: String, required: true },
    estimatedPrice: { type: Number, default: 25 }
  }]
}, {
  timestamps: true
});

const DamageAssessment = mongoose.model('DamageAssessment', damageAssessmentSchema);
export default DamageAssessment;
