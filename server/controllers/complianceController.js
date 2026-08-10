import ComplianceAuditService from '../services/complianceAuditService.js';

export const submitInsurance = async (req, res) => {
  try {
    const workerId = req.user ? req.user.id : req.body.workerId;
    const record = await ComplianceAuditService.submitInsuranceDetails(workerId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Insurance policy details submitted.',
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBackgroundCheck = async (req, res) => {
  try {
    const { workerId, status, referenceId } = req.body;
    const record = await ComplianceAuditService.updateBackgroundCheck(workerId, status, referenceId);
    return res.status(200).json({
      success: true,
      message: 'Background check status updated.',
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComplianceRecord = async (req, res) => {
  try {
    const workerId = req.params.workerId || (req.user && req.user.id);
    const record = await ComplianceAuditService.getCompliance(workerId);
    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
