import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full legal name is required'],
    trim: true,
    maxlength: [120, 'Name must be less than 120 characters']
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  idType: {
    type: String,
    enum: ['passport', 'drivers_license', 'national_id'],
    default: null
  },
  idNumber: {
    type: String,
    trim: true,
    default: ''
  },
  idDocument: {
    type: String,
    default: ''
  },
  selfieWithId: {
    type: String,
    default: ''
  },
  addressProof: {
    type: String,
    default: ''
  },
  professionalLicense: {
    type: String,
    default: ''
  },
  insuranceProof: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

verificationSchema.index({ workerId: 1 }, { unique: true });
verificationSchema.index({ status: 1, createdAt: -1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
