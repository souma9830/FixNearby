import WorkerSkillCert from '../models/WorkerSkillCert.js';

export const submitSkillCert = async (req, res) => {
  try {
    const { skillTitle, issuingAuthority, licenseNumber, issuedDate, expirationDate, certDocumentUrl } = req.body;
    const cert = await WorkerSkillCert.create({
      workerId: req.user._id,
      skillTitle,
      issuingAuthority,
      licenseNumber,
      issuedDate,
      expirationDate,
      certDocumentUrl
    });

    return res.status(201).json({ success: true, message: 'Skill certification submitted for audit', data: cert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkerSkills = async (req, res) => {
  try {
    const certs = await WorkerSkillCert.find({ workerId: req.params.workerId || req.user._id });
    return res.status(200).json({ success: true, data: certs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
