import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SearchPreset from '../models/SearchPreset.js';
import searchRoutes from '../routes/searchRoutes.js';
import errorHandler from '../middleware/errorHandler.js';

dotenv.config();

const PORT = 5595;
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (id) => {
  return jwt.sign({ id }, TEST_JWT_SECRET, { expiresIn: '1d' });
};

async function runTests() {
  console.log('--- STARTING SEARCH PRESETS INTEGRATION TESTS ---');

  // Connect to Database
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  // Clean up existing test data
  console.log('Cleaning up old test data...');
  const testEmail = 'preset_test_user@example.com';
  await User.deleteMany({ email: testEmail });
  
  // Create a test user
  const testUser = await User.create({
    name: 'Preset Test User',
    email: testEmail,
    password: 'Password123!',
    role: 'customer'
  });

  const token = generateToken(testUser._id);
  console.log(`Generated test token: ${token.substring(0, 15)}...`);

  // Clean up presets for this user
  await SearchPreset.deleteMany({ user: testUser._id });

  // Initialize Express and HTTP Server
  const app = express();
  app.use(express.json());
  
  // Register routes
  app.use('/api/search', searchRoutes);
  app.use(errorHandler);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    // 1. Verify saving a search preset
    console.log('\nTest 1: Creating a search preset template...');
    const createRes = await fetch(`http://localhost:${PORT}/api/search/presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Electrician under 50',
        query: 'electrician',
        filters: {
          category: 'Electrician',
          minPrice: 10,
          maxPrice: 50,
          minRating: 4,
          maxDistance: 15,
          availability: 'available',
          sortBy: 'price'
        }
      })
    });
    
    const createBody = await createRes.json();
    console.log(`- Status: ${createRes.status}, Message: ${createBody.message}`);
    if (createRes.status !== 201 || !createBody.success) {
      throw new Error('Failed to create search preset.');
    }
    
    const presetId = createBody.preset._id;
    console.log(`SUCCESS: Created search preset with ID: ${presetId}`);

    // 2. Verify validation (creating a preset without name should fail)
    console.log('\nTest 2: Creating a search preset without a name...');
    const invalidCreateRes = await fetch(`http://localhost:${PORT}/api/search/presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: 'electrician',
        filters: { category: 'Electrician' }
      })
    });
    
    const invalidCreateBody = await invalidCreateRes.json();
    console.log(`- Status: ${invalidCreateRes.status}, Message: ${invalidCreateBody.message}`);
    if (invalidCreateRes.status !== 400 || invalidCreateBody.success) {
      throw new Error('Expected 400 Bad Request when preset name is missing.');
    }
    console.log('SUCCESS: Preset validation correctly blocked naming omissions.');

    // 3. Verify fetching user presets
    console.log('\nTest 3: Fetching user search presets...');
    const getRes = await fetch(`http://localhost:${PORT}/api/search/presets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const getBody = await getRes.json();
    console.log(`- Status: ${getRes.status}, Presets Count: ${getBody.presets?.length}`);
    if (getRes.status !== 200 || !getBody.success) {
      throw new Error('Failed to retrieve search presets.');
    }
    
    const matchedPreset = getBody.presets.find(p => p._id === presetId);
    if (!matchedPreset) {
      throw new Error('Saved search preset was not found in the list.');
    }
    if (matchedPreset.filters.maxPrice !== 50 || matchedPreset.filters.category !== 'Electrician') {
      throw new Error('Filters are mismatching the saved template.');
    }
    console.log('SUCCESS: Correctly retrieved saved preset filters from backend.');

    // 4. Verify deleting a preset
    console.log('\nTest 4: Deleting search preset...');
    const deleteRes = await fetch(`http://localhost:${PORT}/api/search/presets/${presetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const deleteBody = await deleteRes.json();
    console.log(`- Status: ${deleteRes.status}, Message: ${deleteBody.message}`);
    if (deleteRes.status !== 200 || !deleteBody.success) {
      throw new Error('Failed to delete search preset.');
    }
    
    // Verify deletion check
    const checkRes = await fetch(`http://localhost:${PORT}/api/search/presets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const checkBody = await checkRes.json();
    if (checkBody.presets.some(p => p._id === presetId)) {
      throw new Error('Preset was not deleted from the database.');
    }
    console.log('SUCCESS: Saved search template correctly deleted.');

  } finally {
    // Cleanup
    console.log('\nCleaning up database entries...');
    await User.deleteMany({ email: testEmail });
    await SearchPreset.deleteMany({ user: testUser._id });
    await mongoose.connection.close();
    server.close();
  }
}

runTests().then(() => {
  console.log('\n--- ALL SEARCH PRESETS INTEGRATION TESTS PASSED ---');
  process.exit(0);
}).catch(err => {
  console.error('\nINTEGRATION TESTS FAILED:', err);
  process.exit(1);
});
