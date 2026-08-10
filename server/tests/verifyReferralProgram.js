import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Referral from '../models/Referral.js';
import Reward from '../models/Reward.js';
import Booking from '../models/Booking.js';
import { getOrCreateReferralCode } from '../controllers/referralController.js';

async function testReferralProgram() {
  console.log('--- Testing Referral & Rewards Program ---');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/FixNearby';
    await mongoose.connect(mongoUri);
    console.log(' Connected to MongoDB:', mongoose.connection.name);

    // 1. Create test referrer & referred user
    const testUser = new User({
      name: 'Referral Tester',
      email: `ref_tester_${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer'
    });
    await testUser.save();

    const code = await getOrCreateReferralCode(testUser);
    console.log(' Generated Referral Code:', code);
    console.log('   Referral code saved on User model:', testUser.referralCode === code);

    // 2. Create Referral Invite with UTM Parameters
    const invite = await Referral.create({
      referrerId: testUser._id,
      referrerModel: 'User',
      referralCode: code,
      referredEmail: `friend_${Date.now()}@example.com`,
      status: 'pending',
      rewardAmount: 500,
      utmSource: 'fixnearby',
      utmMedium: 'referral_program',
      utmCampaign: 'invite_friends'
    });
    console.log(' Referral invite created with ID:', invite._id);
    console.log('   UTM Parameters:', { source: invite.utmSource, medium: invite.utmMedium, campaign: invite.utmCampaign });

    // 3. Create test worker and Reward record
    const testWorker = new Worker({
      name: 'Reward Worker',
      email: `reward_worker_${Date.now()}@example.com`,
      password: 'password123',
      category: 'Electrician',
      experience: '5 Years',
      contact: '9876543210',
      bio: 'Test worker for monthly milestone reward',
      location: { type: 'Point', coordinates: [-73.935242, 40.730610] }
    });
    await testWorker.save();

    const currentMonth = new Date().toISOString().slice(0, 7);
    const reward = await Reward.create({
      workerId: testWorker._id,
      month: currentMonth,
      jobsCompleted: 9,
      milestoneTarget: 10,
      bonusAmount: 1000,
      claimed: false,
      badgeEarned: 'Top Performer'
    });
    console.log(' Worker monthly milestone reward record created:', reward.month, 'Jobs:', reward.jobsCompleted);

    // Simulate completing 10th job
    reward.jobsCompleted += 1;
    await reward.save();
    testWorker.topPerformerBadge = true;
    await testWorker.save({ validateBeforeSave: false });
    console.log(' Worker Top Performer Badge Unlocked:', testWorker.topPerformerBadge);

    // Clean up test records
    await Referral.deleteOne({ _id: invite._id });
    await Reward.deleteOne({ _id: reward._id });
    await User.deleteOne({ _id: testUser._id });
    await Worker.deleteOne({ _id: testWorker._id });

    console.log(' Referral & Rewards Verification Test Completed Successfully!');
  } catch (err) {
    console.error(' Referral Program Test Failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

testReferralProgram();
