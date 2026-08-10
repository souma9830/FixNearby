import crypto from 'crypto';

export class Aes256GcmStreamExportEngine {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = crypto.scryptSync(process.env.EXPORT_SECRET || 'secret-key-salt', 'salt', 32);
  }

  encryptPayload(dataObj) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    const jsonStr = JSON.stringify(dataObj);
    let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return {
      iv: iv.toString('hex'),
      authTag,
      encryptedData: encrypted
    };
  }

  decryptPayload(packageObj) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(packageObj.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(packageObj.authTag, 'hex'));
    let decrypted = decipher.update(packageObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}

export default new Aes256GcmStreamExportEngine();
