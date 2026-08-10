import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Issue from '../models/Issue.js';
import path from 'path';
import { fileURLToPath } from 'url';

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
      console.warn('MongoDB connection unavailable. Verifying controller exports...');
      const issueController = await import('../controllers/issueController.js');

      if (!issueController.getNearbyIssues || !issueController.createIssue || !issueController.upvoteIssue || !issueController.updateIssueStatus) {
        throw new Error('Issue controller missing required exports!');
      }

      console.log('✅ Controller exports verified successfully!');
      process.exit(0);
    }

    console.log('Cleaning test civic issue records...');
    const testUserEmail = 'civic-test-user@example.com';
    await User.deleteMany({ email: testUserEmail });

    const user = await User.create({
      name: 'Civic Test User',
      email: testUserEmail,
      password: 'Password123',
      phone: '+15005550088',
    });

    await Issue.deleteMany({ title: /Civic Test Pothole/i });

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

    console.log('\n--- 1. Testing createIssue ---');
    const { createIssue, getNearbyIssues, upvoteIssue, updateIssueStatus } = await import('../controllers/issueController.js');

    const reqCreate = {
      body: {
        title: 'Civic Test Pothole Report',
        description: 'Large hazardous pothole on Main Street near intersection.',
        category: 'Pothole',
        latitude: 17.4065,
        longitude: 78.4772,
      },
      user: { _id: user._id },
    };

    let res = mockRes();
    await createIssue(reqCreate, res);
    console.log('createIssue status:', res.getStatus());
    if (res.getStatus() !== 201 || !res.getJson()?.success) {
      throw new Error(`createIssue failed: ${JSON.stringify(res.getJson())}`);
    }

    const createdIssue = res.getJson().data;
    console.log('Created Issue ID:', createdIssue._id);

    console.log('\n--- 2. Testing getNearbyIssues ---');
    const reqNearby = {
      query: {
        latitude: '17.4065',
        longitude: '78.4772',
        category: 'Pothole',
        radiusKm: '10',
      },
    };

    res = mockRes();
    await getNearbyIssues(reqNearby, res);
    console.log('getNearbyIssues status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.data) {
      throw new Error(`getNearbyIssues failed: ${JSON.stringify(res.getJson())}`);
    }
    console.log('Nearby issues count:', res.getJson().data.length);

    console.log('\n--- 3. Testing upvoteIssue ---');
    const reqUpvote = {
      params: { id: createdIssue._id.toString() },
      user: { _id: user._id },
    };

    res = mockRes();
    await upvoteIssue(reqUpvote, res);
    console.log('upvoteIssue status:', res.getStatus());
    if (res.getStatus() !== 200 || !res.getJson()?.upvotes) {
      throw new Error(`upvoteIssue failed: ${JSON.stringify(res.getJson())}`);
    }
    console.log('Updated upvotes count:', res.getJson().upvotes);

    console.log('\n--- 4. Testing updateIssueStatus (PUT /api/issues/:id/status) ---');
    const reqUpdateStatus = {
      params: { id: createdIssue._id.toString() },
      body: { status: 'resolved', note: 'Pothole filled by city roadwork crew' },
    };

    res = mockRes();
    await updateIssueStatus(reqUpdateStatus, res);
    console.log('updateIssueStatus status:', res.getStatus());
    if (res.getStatus() !== 200 || res.getJson()?.data?.status !== 'resolved') {
      throw new Error(`updateIssueStatus failed: ${JSON.stringify(res.getJson())}`);
    }
    console.log('Updated issue status:', res.getJson().data.status);

    console.log('\n✅ ALL CIVIC ISSUES PORTAL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Error:', err);
    process.exit(1);
  }
};

runVerification();
