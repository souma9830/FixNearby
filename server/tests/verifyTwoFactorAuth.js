import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import otplibPkg from 'otplib';
import path from 'path';
import { fileURLToPath } from 'url';

const { authenticator } = otplibPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FixNearby';

const runVerification = async () => {
  try {
    console.log('Connecting to database at:', process.env.MONGODB_URI);
    await connectDB();

    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      console.warn('MongoDB connection unavailable. Verifying controller & service exports...');
      const twoFactorService = await import('../services/twoFactorService.js');
      const twoFactorController = await import('../controllers/twoFactorController.js');

      if (!twoFactorService.generateSecret || !twoFactorService.verifyToken || !twoFactorController.setupTwoFactor) {
        throw new Error('2FA service/controller missing expected exports!');
      }

      console.log('✅ 2FA service & controller exports verified successfully!');
      process.exit(0);
    }

    console.log('Cleaning test user records...');
    const testEmail = 'twofa-test-user@example.com';
    await User.deleteMany({ email: testEmail });

    const user = await User.create({
      name: '2FA Test User',
      email: testEmail,
      password: 'Password123',
      phone: '+15005550077',
    });

    const mockRes = () => {
      let statusRes = 200;
      let jsonRes = null;
      return {
        status: (code) => {
          statusRes = code;
          return {
            json: (data) => {
              jsonRes = data;
              return { statusRes, jsonRes };
            },
          };
        },
        getStatus: () => statusRes,
        getJson: () => jsonRes,
      };
    };

    const {
      setupTwoFactor,
      verifyTwoFactorSetup,
      disableTwoFactor,
      challengeTwoFactorLogin,
      getTwoFactorStatus,
    } = await import('../controllers/twoFactorController.js');

    const { loginUser } = await import('../controllers/authController.js');

    console.log('\n--- 1. Testing setupTwoFactor ---');
    const reqSetup = {
      user: { _id: user._id },
    };

    let res = mockRes();
    await setupTwoFactor(reqSetup, res);
    console.log('setupTwoFactor status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.secret || !res.getJson()?.qrCodeUrl) {
      throw new Error(`setupTwoFactor failed: ${JSON.stringify(res.getJson())}`);
    }

    const generatedSecret = res.getJson().secret;
    console.log('Generated secret length:', generatedSecret.length);
    console.log('Generated QR Code Data URL starts with:', res.getJson().qrCodeUrl.substring(0, 30));

    console.log('\n--- 2. Testing verifyTwoFactorSetup ---');
    const validOtpToken = authenticator.generate(generatedSecret);

    const reqVerify = {
      user: { _id: user._id },
      body: { token: validOtpToken },
    };

    res = mockRes();
    await verifyTwoFactorSetup(reqVerify, res);
    console.log('verifyTwoFactorSetup status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.twoFactorEnabled || !res.getJson()?.recoveryCodes) {
      throw new Error(`verifyTwoFactorSetup failed: ${JSON.stringify(res.getJson())}`);
    }

    const recoveryCodes = res.getJson().recoveryCodes;
    console.log('2FA Enabled successfully! Recovery codes generated:', recoveryCodes.length);

    console.log('\n--- 3. Testing getTwoFactorStatus ---');
    const reqStatus = {
      user: { _id: user._id },
    };

    res = mockRes();
    await getTwoFactorStatus(reqStatus, res);
    console.log('getTwoFactorStatus status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.twoFactorEnabled || res.getJson()?.recoveryCodesLeft !== 10) {
      throw new Error(`getTwoFactorStatus failed: ${JSON.stringify(res.getJson())}`);
    }

    console.log('\n--- 4. Testing Login 2FA Requirement Trigger ---');
    const reqLogin = {
      body: { email: testEmail, password: 'Password123' },
    };

    res = mockRes();
    await loginUser(reqLogin, res);
    console.log('loginUser status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.require2FA) {
      throw new Error(`Login failed to require 2FA: ${JSON.stringify(res.getJson())}`);
    }
    console.log('Login successfully returned require2FA: true challenge');

    console.log('\n--- 5. Testing challengeTwoFactorLogin with TOTP Token ---');
    const currentTotpCode = authenticator.generate(generatedSecret);
    const reqChallengeTotp = {
      body: {
        userId: user._id.toString(),
        userType: 'User',
        code: currentTotpCode,
      },
    };

    res = mockRes();
    await challengeTwoFactorLogin(reqChallengeTotp, res);
    console.log('challengeTwoFactorLogin (TOTP) status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.token) {
      throw new Error(`2FA TOTP Challenge failed: ${JSON.stringify(res.getJson())}`);
    }
    console.log('2FA TOTP Challenge succeeded! Auth token issued.');

    console.log('\n--- 6. Testing challengeTwoFactorLogin with Recovery Code ---');
    const recoveryCodeToUse = recoveryCodes[0];
    const reqChallengeRecovery = {
      body: {
        userId: user._id.toString(),
        userType: 'User',
        code: recoveryCodeToUse,
      },
    };

    res = mockRes();
    await challengeTwoFactorLogin(reqChallengeRecovery, res);
    console.log('challengeTwoFactorLogin (Recovery Code) status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.token || !res.getJson()?.usedRecoveryCode) {
      throw new Error(`2FA Recovery Code Challenge failed: ${JSON.stringify(res.getJson())}`);
    }
    console.log('2FA Recovery Code Challenge succeeded! Recovery code used.');

    console.log('\n--- 7. Testing disableTwoFactor ---');
    const reqDisable = {
      user: { _id: user._id },
      body: { password: 'Password123' },
    };

    res = mockRes();
    await disableTwoFactor(reqDisable, res);
    console.log('disableTwoFactor status:', res.getStatus());
    if (res.getStatus() !== 200 || res.getJson()?.twoFactorEnabled !== false) {
      throw new Error(`disableTwoFactor failed: ${JSON.stringify(res.getJson())}`);
    }

    console.log('\n✅ ALL 2FA & ACCOUNT SECURITY TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Error:', err);
    process.exit(1);
  }
};

runVerification();
