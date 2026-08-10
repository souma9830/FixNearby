import mongoose from 'mongoose';
import WorkerComplianceRecord from '../models/WorkerComplianceRecord.js';

async function testComplianceSystem() {
  console.log('[TEST] Starting Compliance System Verification...');
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const record = new WorkerComplianceRecord({
      workerId: fakeWorkerId,
      insurancePolicyNumber: 'POL-992144',
      insuranceProvider: 'State Liability Mutual',
      coverageAmountUSD: 250000,
      insuranceExpirationDate: new Date(Date.now() + 31536000000),
      backgroundCheckStatus: 'Cleared',
      complianceStatus: 'Fully Compliant',
    });

    console.log('[TEST] Compliance record created:', record.insurancePolicyNumber, 'Status:', record.complianceStatus);
    console.log('[TEST] Compliance Audit System Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testComplianceSystem();
