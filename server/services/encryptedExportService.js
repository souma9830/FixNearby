import { encryptDataPayload, decryptDataPayload } from '../utils/streamEncryptor.js';

export const generateEncryptedAuditReport = (reportData, secretKey = 'DefaultSecretPassphrase') => {
  const jsonPayload = JSON.stringify({
    reportId: `RPT_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    recordsCount: Array.isArray(reportData) ? reportData.length : 1,
    data: reportData
  });

  const encryptedPackage = encryptDataPayload(jsonPayload, secretKey);
  return encryptedPackage;
};

export const verifyEncryptedAuditReport = (encryptedPackage, secretKey = 'DefaultSecretPassphrase') => {
  const decryptedJson = decryptDataPayload(encryptedPackage, secretKey);
  return JSON.parse(decryptedJson);
};
