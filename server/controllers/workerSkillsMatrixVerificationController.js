import WorkerSkillsMatrixVerification from '../models/WorkerSkillsMatrixVerification.js';
import SkillEndorsementAudit from '../models/SkillEndorsementAudit.js';

export const getWorkerSkillsMatrix = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    let matrix = await WorkerSkillsMatrixVerification.findOne({ workerId });

    if (!matrix) {
      matrix = await WorkerSkillsMatrixVerification.create({
        workerId,
        primarySkillCategory: 'General Services',
        certifiedSkills: [],
      });
    }

    res.status(200).json({ success: true, data: matrix });
  } catch (error) {
    next(error);
  }
};

export const addSkillCertification = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { skillName, proficiencyLevel, issuingAuthority, certificationId, validUntil } = req.body;

    let matrix = await WorkerSkillsMatrixVerification.findOne({ workerId });
    if (!matrix) {
      matrix = new WorkerSkillsMatrixVerification({ workerId, primarySkillCategory: 'Electrical/Plumbing' });
    }

    matrix.certifiedSkills.push({
      skillName,
      proficiencyLevel,
      issuingAuthority,
      certificationId,
      validUntil,
      verificationStatus: 'verified',
    });

    await matrix.save();

    res.status(201).json({ success: true, message: 'Skill certification added', data: matrix });
  } catch (error) {
    next(error);
  }
};

export const endorseWorkerSkill = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { skillName, endorsementRating, bookingId, comment } = req.body;

    const endorsement = await SkillEndorsementAudit.create({
      workerId,
      endorsedByUserId: req.user._id || req.user.id,
      skillName,
      endorsementRating: endorsementRating || 5,
      verifiedJobContextId: bookingId || null,
      comment: comment || '',
    });

    res.status(201).json({
      success: true,
      message: 'Worker skill endorsed successfully and audit trail logged',
      data: endorsement,
    });
  } catch (error) {
    next(error);
  }
};

