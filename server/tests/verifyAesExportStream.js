import aesExporter from '../services/aesExportStreamService.js';

describe('AES-256-GCM Encrypted Compliance Export Engine Test', () => {
  it('should encrypt report payload and decrypt cleanly with authentication tag', () => {
    const reportData = { reportId: 'RPT_101', records: 5, user: 'admin@company.com' };
    const pkg = aesExporter.encryptPayload(reportData);
    expect(pkg).toHaveProperty('iv');
    expect(pkg).toHaveProperty('authTag');

    const recovered = aesExporter.decryptPayload(pkg);
    expect(recovered).toEqual(reportData);
  });
});
