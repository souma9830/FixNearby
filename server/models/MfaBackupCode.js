import mongoose from 'mongoose';

const mfaBackupCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  codeHash: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const MfaBackupCode = mongoose.model('MfaBackupCode', mfaBackupCodeSchema);
export default MfaBackupCode;
