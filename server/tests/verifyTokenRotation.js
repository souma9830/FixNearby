import mongoose from 'mongoose';
import { generateRefreshToken, rotateRefreshToken } from '../services/refreshTokenService.js';
import RefreshToken from '../models/RefreshToken.js';

async function runTest() {
  console.log("=== STARTING DUAL TOKEN JWT REFRESH ROTATION INTEGRATION TEST ===");
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixnearby_test');

  const mockUserId = new mongoose.Types.ObjectId();

  // 1. Generate initial refresh token
  console.log("\n1. Generating initial refresh token...");
  const t1 = await generateRefreshToken(mockUserId, '192.168.1.1', 'Mozilla/5.0');
  console.log("Initial Token:", t1);

  // 2. Rotate token legitimately
  console.log("\n2. Rotating token legitimately...");
  const t2 = await rotateRefreshToken(t1.token, '192.168.1.1');
  console.log("Rotated Token 2:", t2);

  const t1Doc = await RefreshToken.findOne({ token: t1.token });
  console.log("Token 1 Revoked Status:", t1Doc.isRevoked);

  if (t1Doc.isRevoked && t2.familyId === t1.familyId) {
    console.log("✅ SUCCESS: Token rotated and old token marked revoked!");
  }

  // 3. Simulating token reuse attack (Attacker tries using old t1.token again)
  console.log("\n3. Simulating token reuse attack with revoked token...");
  try {
    await rotateRefreshToken(t1.token, '192.168.1.100');
    console.error("❌ FAILURE: Token reuse was not detected!");
  } catch (err) {
    console.log("Reuse Exception Caught:", err.message);

    const familyTokens = await RefreshToken.find({ familyId: t1.familyId });
    const allRevoked = familyTokens.every(t => t.isRevoked);

    if (allRevoked) {
      console.log("=============================================");
      console.log("✅ ALL DUAL TOKEN REFRESH ROTATION TESTS PASSED!");
      console.log("=============================================");
    }
  }

  await RefreshToken.deleteMany({ userId: mockUserId });
  await mongoose.disconnect();
}

runTest().catch(console.error);
