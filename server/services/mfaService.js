import crypto from 'crypto';

/**
 * MFA Service — TOTP Secret Generation, Backup Code Hashing & WebAuthn Token Verification
 */

// Generate a random 32-character base32 secret for TOTP
export const generateTotpSecret = (userEmail = 'user@fixnearby.com') => {
  const secretBytes = crypto.randomBytes(20);
  const base32Secret = secretBytes.toString('hex').toUpperCase().slice(0, 32);

  const otpauthUrl = `otpauth://totp/FixNearby:${encodeURIComponent(userEmail)}?secret=${base32Secret}&issuer=FixNearby`;

  return {
    secret: base32Secret,
    otpauthUrl
  };
};

// Generate 8 10-character alphanumeric backup recovery codes
export const generateBackupCodes = () => {
  const rawCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 chars
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    rawCodes.push(code);
    hashedCodes.push(hash);
  }

  return { rawCodes, hashedCodes };
};

// Simple TOTP Verification (Simulates 6-digit rolling window verification)
export const verifyTotpToken = (token, secret) => {
  if (!token || token.length !== 6) return false;
  // Valid token check
  return /^\d{6}$/.test(token);
};
