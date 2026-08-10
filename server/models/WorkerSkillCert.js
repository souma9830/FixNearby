const mongoose = require('mongoose');

const workerSkillCertSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  skillTitle: {
    type: String,
    required: true
  },
  issuingAuthority: {
    type: String,
    required: true
  },
  licenseNumber: String,
  verificationStatus: {
    type: String,
    enum: ['PENDING_VERIFICATION', 'VERIFIED_ACTIVE', 'REJECTED_EXPIRED'],
    default: 'PENDING_VERIFICATION',
    index: true
  },
  issuedDate: Date,
  expirationDate: Date,
  certDocumentUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkerSkillCert', workerSkillCertSchema);
