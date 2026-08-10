import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Verification from '../models/Verification.js';
import Issue from '../models/Issue.js';
import { getAdminStats, getAdminUsers, banUser } from '../controllers/adminController.js';

async function testAdminBackend() {
  console.log('--- Testing Admin Dashboard Backend ---');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fixnearby';
    await mongoose.connect(mongoUri);
    console.log(' Connected to MongoDB:', mongoose.connection.name);

    // Mock Express req/res
    let statsData = null;
    const reqStats = {};
    const resStats = {
      json: (data) => { statsData = data; },
      status: function() { return this; }
    };
    await getAdminStats(reqStats, resStats);
    console.log(' getAdminStats result success:', statsData?.success);
    console.log('   KPI Stats:', statsData?.stats);
    console.log('   Analytics days series length:', statsData?.analytics?.length);
    console.log('   System Health DB status:', statsData?.systemHealth?.dbStatus);

    let usersData = null;
    const reqUsers = { query: { page: 1, limit: 5, role: 'all', status: 'all' } };
    const resUsers = {
      json: (data) => { usersData = data; },
      status: function() { return this; }
    };
    await getAdminUsers(reqUsers, resUsers);
    console.log(' getAdminUsers result success:', usersData?.success);
    console.log('   Total users returned:', usersData?.users?.length);

    console.log(' Admin Dashboard Backend Test Completed Successfully!');
  } catch (err) {
    console.error(' Admin Backend Test Failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAdminBackend();
