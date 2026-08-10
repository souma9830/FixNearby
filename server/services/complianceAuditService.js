import WorkerComplianceRecord from '../models/WorkerComplianceRecord.js';

class ComplianceAuditService {
  static async submitInsuranceDetails(workerId, payload) {
    let record = await WorkerComplianceRecord.findOne({ workerId });
    if (!record) {
      record = new WorkerComplianceRecord({ workerId });
    }

    record.insurancePolicyNumber = payload.insurancePolicyNumber;
    record.insuranceProvider = payload.insuranceProvider;
    record.coverageAmountUSD = payload.coverageAmountUSD;
    record.insuranceExpirationDate = new Date(payload.insuranceExpirationDate);

    const now = new Date();
    if (record.insuranceExpirationDate > now && record.backgroundCheckStatus === 'Cleared') {
      record.complianceStatus = 'Fully Compliant';
      record.verifiedAt = now;
    } else {
      record.complianceStatus = 'Action Required';
    }

    return await record.save();
  }

  static async updateBackgroundCheck(workerId, status, referenceId) {
    let record = await WorkerComplianceRecord.findOne({ workerId });
    if (!record) {
      record = new WorkerComplianceRecord({ workerId });
    }

    record.backgroundCheckStatus = status;
    if (referenceId) record.backgroundCheckReferenceId = referenceId;

    const now = new Date();
    if (status === 'Cleared' && record.insuranceExpirationDate && record.insuranceExpirationDate > now) {
      record.complianceStatus = 'Fully Compliant';
      record.verifiedAt = now;
    } else if (status === 'Failed') {
      record.complianceStatus = 'Suspended';
    }

    return await record.save();
  }

  static async getCompliance(workerId) {
    return await WorkerComplianceRecord.findOne({ workerId });
  }
}

export default ComplianceAuditService;
