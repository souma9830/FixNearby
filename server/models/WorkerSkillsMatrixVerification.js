import mongoose from 'mongoose';

const workerSkillsMatrixVerificationSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    primarySkillCategory: {
      type: String,
      required: true,
    },
    certifiedSkills: [
      {
        skillName: { type: String, required: true },
        proficiencyLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'expert', 'master'],
          default: 'intermediate',
        },
        issuingAuthority: { type: String, required: true },
        certificationId: { type: String, required: true },
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected', 'expired'],
          default: 'pending',
        },
        validUntil: { type: Date, required: true },
      },
    ],
    overallSkillScore: {
      type: Number,
      default: 85,
    },
  },
  { timestamps: true }
);

const WorkerSkillsMatrixVerification = mongoose.model(
  'WorkerSkillsMatrixVerification',
  workerSkillsMatrixVerificationSchema
);
export default WorkerSkillsMatrixVerification;
