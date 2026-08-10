import { generateEncryptedAuditReport, verifyEncryptedAuditReport } from '../services/encryptedExportService.js';

async function runTests() {
  console.log("=== STARTING AES-256 ENCRYPTED EXPORT REPORT TEST ===");

  const sampleReportData = [
    { id: 1, action: 'USER_LOGIN', user: 'admin@company.com' },
    { id: 2, action: 'SETTINGS_UPDATE', user: 'security@company.com' }
  ];
  const secretKey = 'SuperSecretAuditEncryptionKey';

  // 1. Encrypting Report Package
  console.log("\n1. Encrypting audit report package with AES-256-GCM...");
  const pkg = generateEncryptedAuditReport(sampleReportData, secretKey);
  console.log("Encrypted Package Structure:", {
    iv: pkg.iv,
    authTag: pkg.authTag,
    encryptedDataPreview: pkg.encryptedData.substring(0, 32) + '...'
  });

  if (pkg.iv && pkg.authTag && pkg.encryptedData) {
    console.log("✅ SUCCESS: Report package encrypted successfully!");
  }

  // 2. Decrypting and Verifying Report Integrity
  console.log("\n2. Decrypting report package and verifying integrity...");
  const restored = verifyEncryptedAuditReport(pkg, secretKey);
  console.log("Decrypted Report Data:", restored);

  if (restored.recordsCount === 2 && restored.data[0].action === 'USER_LOGIN') {
    console.log("=============================================");
    console.log("✅ ALL ENCRYPTED EXPORT REPORT TESTS PASSED!");
    console.log("=============================================");
  }
}

runTests().catch(console.error);
