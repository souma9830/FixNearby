import mongoose from 'mongoose';

const skillEndorsementAuditSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    endorsedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillName: {
      type: String,
      required: true,
    },
    endorsementRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    verifiedJobContextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const SkillEndorsementAudit = mongoose.model('SkillEndorsementAudit', skillEndorsementAuditSchema);
export default SkillEndorsementAudit;
