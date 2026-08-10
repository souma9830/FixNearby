import { auditWorkerCompliance } from '../services/workerComplianceAuditor.js';

function runTests() {
  console.log('Running Worker Compliance Auditor Tests...');

  // Test 1: Fully Compliant Worker
  const compliant = auditWorkerCompliance({
    isIdentityVerified: true,
    backgroundCheckDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    insuranceExpiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000),
    licenseNumber: 'LIC-998877',
    licenseExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000)
  });

  if (!compliant.isFullyCompliant || compliant.flags.length !== 0) {
    throw new Error('Test 1 Failed: Compliant worker improperly flagged');
  }
  console.log('✓ Test 1 Passed: Fully compliant worker verified.');

  // Test 2: Expired License & Missing Background Check
  const nonCompliant = auditWorkerCompliance({
    isIdentityVerified: false,
    licenseExpiryDate: new Date(Date.now() - 10 * 24 * 3600 * 1000)
  });

  if (nonCompliant.isFullyCompliant || !nonCompliant.flags.includes('IDENTITY_NOT_VERIFIED')) {
    throw new Error('Test 2 Failed: Non-compliant worker passed compliance check');
  }
  console.log('✓ Test 2 Passed: Non-compliant worker flagged accurately.');

  console.log('All Worker Compliance Auditor tests passed successfully!');
}

runTests();
