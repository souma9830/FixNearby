import WorkerSkillCertification from '../models/WorkerSkillCertification.js';

class SkillVerificationService {
  static async addWorkerSkill(workerId, skillData) {
    const existing = await WorkerSkillCertification.findOne({
      workerId,
      skillName: skillData.skillName.trim(),
    });

    if (existing) {
      throw new Error('Worker already has this skill certification registered.');
    }

    const certification = new WorkerSkillCertification({
      workerId,
      skillCategory: skillData.skillCategory,
      skillName: skillData.skillName.trim(),
      proficiencyLevel: skillData.proficiencyLevel || 'Journeyman',
      licenseNumber: skillData.licenseNumber || null,
      issuingAuthority: skillData.issuingAuthority || null,
      issueDate: skillData.issueDate ? new Date(skillData.issueDate) : null,
      expirationDate: skillData.expirationDate ? new Date(skillData.expirationDate) : null,
      documentUrl: skillData.documentUrl || null,
      verificationStatus: 'Pending',
    });

    return await certification.save();
  }

  static async getWorkerSkills(workerId) {
    return await WorkerSkillCertification.find({ workerId }).sort({ createdAt: -1 });
  }

  static async auditExpiredCertifications() {
    const now = new Date();
    const result = await WorkerSkillCertification.updateMany(
      {
        expirationDate: { $lt: now },
        verificationStatus: 'Verified',
      },
      {
        $set: { verificationStatus: 'Expired' },
      }
    );
    return result;
  }

  static async verifySkill(certificationId, adminId, status, rejectionReason = null) {
    const cert = await WorkerSkillCertification.findById(certificationId);
    if (!cert) {
      throw new Error('Certification record not found');
    }

    cert.verificationStatus = status;
    cert.verifiedBy = adminId;
    cert.verifiedAt = new Date();
    if (status === 'Rejected') {
      cert.rejectionReason = rejectionReason || 'Documentation insufficient';
    }

    return await cert.save();
  }
}

export default SkillVerificationService;
