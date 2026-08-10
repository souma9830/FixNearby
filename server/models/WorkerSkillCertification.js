import mongoose from 'mongoose';

const workerSkillCertificationSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  skillCategory: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Appliance Repair', 'Roofing', 'Painting', 'General Maintenance'],
  },
  skillName: {
    type: String,
    required: true,
    trim: true,
  },
  proficiencyLevel: {
    type: String,
    enum: ['Apprentice', 'Journeyman', 'Master', 'Certified Specialist'],
    default: 'Journeyman',
  },
  licenseNumber: {
    type: String,
    trim: true,
    default: null,
  },
  issuingAuthority: {
    type: String,
    trim: true,
    default: null,
  },
  issueDate: {
    type: Date,
    default: null,
  },
  expirationDate: {
    type: Date,
    default: null,
  },
  documentUrl: {
    type: String,
    default: null,
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Expired'],
    default: 'Pending',
    index: true,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  yearsExperience: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
});

workerSkillCertificationSchema.index({ workerId: 1, skillName: 1 }, { unique: true });

export default mongoose.model('WorkerSkillCertification', workerSkillCertificationSchema);
