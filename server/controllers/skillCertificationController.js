import SkillVerificationService from '../services/skillVerificationService.js';

export const addSkill = async (req, res) => {
  try {
    const workerId = req.user ? req.user.id : req.body.workerId;
    const skill = await SkillVerificationService.addWorkerSkill(workerId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Skill certification submitted successfully.',
      data: skill,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSkills = async (req, res) => {
  try {
    const workerId = req.params.workerId || (req.user && req.user.id);
    const skills = await SkillVerificationService.getWorkerSkills(workerId);
    return res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const auditExpired = async (req, res) => {
  try {
    const auditResult = await SkillVerificationService.auditExpiredCertifications();
    return res.status(200).json({
      success: true,
      message: 'Expired skill certifications audited successfully.',
      data: auditResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const workerId = req.user ? req.user.id : req.body.workerId;
    const result = await SkillVerificationService.removeWorkerSkill(workerId, req.params.skillId);
    return res.status(200).json({
      success: true,
      message: 'Skill certification removed',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
