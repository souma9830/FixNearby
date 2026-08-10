import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

export const generateRefreshToken = async (userId, ipAddress = '', userAgent = '', familyId = null) => {
  const token = crypto.randomBytes(40).toString('hex');
  const tokenFamily = familyId || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const doc = await RefreshToken.create({
    token,
    userId,
    familyId: tokenFamily,
    ipAddress,
    userAgent,
    expiresAt
  });

  return { token: doc.token, familyId: doc.familyId };
};

export const rotateRefreshToken = async (oldToken, ipAddress = '') => {
  const existing = await RefreshToken.findOne({ token: oldToken });
  if (!existing) {
    throw new Error('Invalid refresh token');
  }

  if (existing.isRevoked) {
    // Revocation reuse detected! Invalidate entire token family for security
    await RefreshToken.updateMany({ familyId: existing.familyId }, { isRevoked: true });
    throw new Error('Security alert: Refresh token reuse detected! Revoking token family.');
  }

  // Revoke old token
  existing.isRevoked = true;
  await existing.save();

  // Issue new rotated token in same family
  return generateRefreshToken(existing.userId, ipAddress, existing.userAgent, existing.familyId);
};

export const revokeFamily = async (familyId) => {
  return RefreshToken.updateMany({ familyId }, { isRevoked: true });
};
