import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import express from 'express';
import { createServer } from 'http';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Category from '../models/Category.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Blacklist from '../models/Blacklist.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import serviceRequestRoutes from '../routes/serviceRequestRoutes.js';
import workerRoutes from '../routes/workerRoutes.js';
import { responseCache, invalidateCache } from '../middleware/responseCacheMiddleware.js';
import cacheService from '../services/cacheService.js';

dotenv.config();

const PORT = 5571;
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
process.env.JWT_SECRET = JWT_SECRET;

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/workers', workerRoutes);

const server = createServer(app);

const fetchJson = async (path, options = {}) => {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`, options);
  const body = await res.json().catch(() => ({}));
  return { status: res.status, cache: res.headers.get('x-cache'), body };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- STARTING RESPONSE CACHE LAYER TESTS (Redis-backed) ---');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  // Clear any cached keys from previous test runs
  await cacheService.invalidatePattern('GET:/api/*');
  console.log('Cleared stale cache keys.');

  const testEmail = 'test_cache_admin@example.com';
  const testWorkerEmail = 'test_cache_worker@example.com';
  const testSrEmail = 'test_cache_sr@example.com';
  await User.deleteMany({ email: { $in: [testEmail, testSrEmail] } });
  await Worker.deleteMany({ email: { $in: [testWorkerEmail, 'test_cache_worker2@example.com'] } });
  await Blacklist.deleteMany({});
  await Category.deleteMany({ name: { $in: ['CacheTestCat', 'CacheTestCat2'] } });
  await ServiceRequest.deleteMany({ categoryName: 'CacheTestCat' });

  // Seed categories + one service request with a distinct category
  await Category.create({ name: 'CacheTestCat', slug: 'cachetestcat', isActive: true });
  const srUser = await User.create({
    name: 'Cache SR User',
    email: 'test_cache_sr@example.com',
    password: 'Password123'
  });
  await ServiceRequest.create({
    userId: srUser._id,
    categoryName: 'CacheTestCat',
    title: 'Cache test request',
    description: 'Cache test request body'
  });

  const admin = await User.create({
    name: 'Cache Test Admin',
    email: testEmail,
    password: 'Password123',
    role: 'customer'
  });

  const worker = await Worker.create({
    name: 'Cache Test Worker',
    email: testWorkerEmail,
    password: 'Password123',
    category: 'Plumbing',
    experience: '5 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '1234567890',
    bio: 'Plumber bio info',
    services: [
      { name: 'Leak Fix', description: 'Fix leaks', price: 50, duration: 60, isActive: true }
    ]
  });

  const worker2 = await Worker.create({
    name: 'Cache Test Worker 2',
    email: 'test_cache_worker2@example.com',
    password: 'Password123',
    category: 'Electrical',
    experience: '3 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '1222222222',
    bio: 'Electrician bio info',
    services: [
      { name: 'Wiring', description: 'Fix wiring', price: 80, duration: 60, isActive: true }
    ]
  });

  const adminToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });
  const workerToken = jwt.sign({ id: worker._id }, JWT_SECRET, { expiresIn: '1d' });
  const worker2Token = jwt.sign({ id: worker2._id }, JWT_SECRET, { expiresIn: '1d' });

  console.log('Starting HTTP server...');
  await new Promise((resolve) => server.listen(PORT, resolve));

  const authAdmin = { headers: { Authorization: `Bearer ${adminToken}` } };
  const authWorker = { headers: { Authorization: `Bearer ${workerToken}` } };
  const authWorker2 = { headers: { Authorization: `Bearer ${worker2Token}` } };

  try {
    // --- Test 1: public GET /api/categories caches (MISS then HIT) ---
    console.log('\nTest 1: GET /api/categories MISS -> HIT (public, anonymous scope)');
    const miss = await fetchJson('/api/categories');
    if (miss.status !== 200 || miss.cache !== 'MISS' || !miss.body.categories?.length) {
      throw new Error(`Expected MISS with data, got status=${miss.status} cache=${miss.cache}`);
    }
    const hit = await fetchJson('/api/categories');
    if (hit.cache !== 'HIT') throw new Error(`Expected HIT, got ${hit.cache}`);
    if (JSON.stringify(hit.body) !== JSON.stringify(miss.body)) {
      throw new Error('Cached body differs from original response');
    }
    console.log('SUCCESS: first call MISS, second call HIT with identical body.');

    // --- Test 2: invalidation on category mutation ---
    console.log('\nTest 2: POST /api/categories invalidates the cached list');
    const pre = await fetchJson('/api/categories');
    if (pre.cache !== 'HIT') throw new Error('Expected cache HIT before mutation');
    const created = await fetchJson('/api/categories', {
      method: 'POST',
      ...authAdmin,
      headers: { ...authAdmin.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'CacheTestCat2', slug: 'cachetestcat2' })
    });
    if (created.status !== 201) throw new Error(`Category create failed: ${created.status}`);
    const post = await fetchJson('/api/categories');
    if (post.cache !== 'MISS') throw new Error(`Expected MISS after invalidation, got ${post.cache}`);
    if (!post.body.categories.some((c) => c.name === 'CacheTestCat2')) {
      throw new Error('New category missing from refetched list');
    }
    console.log('SUCCESS: mutation invalidated the Redis cache, refetch is fresh.');

    // --- Test 3: GET /api/service-requests/categories caches too ---
    console.log('\nTest 3: GET /api/service-requests/categories MISS -> HIT');
    const sm = await fetchJson('/api/service-requests/categories');
    if (sm.cache !== 'MISS') throw new Error(`Expected MISS, got ${sm.cache}`);
    const sh = await fetchJson('/api/service-requests/categories');
    if (sh.cache !== 'HIT') throw new Error(`Expected HIT, got ${sh.cache}`);
    if (!sh.body.categories.includes('CacheTestCat')) {
      throw new Error('Distinct categories missing from response');
    }
    console.log('SUCCESS: service-request categories cached after first load.');

    // --- Test 4: per-user cache scoping on protected GET /api/workers/services ---
    console.log('\nTest 4: GET /api/workers/services is scoped per user id');
    const w1 = await fetchJson('/api/workers/services', authWorker);
    if (w1.cache !== 'MISS') throw new Error(`Expected MISS on first worker call, got ${w1.cache}`);
    const w2 = await fetchJson('/api/workers/services', authWorker);
    if (w2.cache !== 'HIT') throw new Error(`Expected HIT on second worker call, got ${w2.cache}`);
    const a1 = await fetchJson('/api/workers/services', authWorker2);
    if (a1.cache !== 'MISS') throw new Error(`Second worker must get own cache entry (MISS), got ${a1.cache}`);
    if (JSON.stringify(a1.body) === JSON.stringify(w1.body)) {
      throw new Error('Different users must not share a cached response');
    }
    console.log('SUCCESS: cache keys include user id; no cross-user cache leakage.');

    // --- Test 5: worker service mutation invalidates the cache ---
    console.log('\nTest 5: POST /api/workers/services invalidates cached worker catalog');
    const before = await fetchJson('/api/workers/services', authWorker);
    if (before.cache !== 'HIT') throw new Error('Expected HIT before mutation');
    const addSvc = await fetchJson('/api/workers/services', {
      method: 'POST',
      ...authWorker,
      headers: { ...authWorker.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pipe Fitting', description: 'Install pipes', price: 120, duration: 90, isActive: true })
    });
    if (addSvc.status !== 201) throw new Error(`Add service failed: ${addSvc.status}`);
    const after = await fetchJson('/api/workers/services', authWorker);
    if (after.cache !== 'MISS') throw new Error(`Expected MISS after service mutation, got ${after.cache}`);
    if (!after.body.services?.some?.((s) => s.name === 'Pipe Fitting')) {
      throw new Error('New service missing from refetched catalog');
    }
    console.log('SUCCESS: service mutation invalidated the cache, refetch shows new service.');

    // --- Test 6: cache-control no-cache bypasses the cache ---
    console.log('\nTest 6: cache-control no-cache bypasses the cache');
    const bypass = await fetchJson('/api/categories', { headers: { 'cache-control': 'no-cache' } });
    if (bypass.cache !== null) throw new Error(`Expected bypass (no cache header), got ${bypass.cache}`);
    const afterBypass = await fetchJson('/api/categories');
    if (afterBypass.cache !== 'HIT') throw new Error(`Expected HIT (bypass must not evict cache), got ${afterBypass.cache}`);
    console.log('SUCCESS: no-cache directive bypasses cached response without evicting it.');

    console.log('\n=============================================');
    console.log('ALL RESPONSE CACHE LAYER TESTS PASSED!');
    console.log('=============================================');
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error);
    process.exit(1);
  } finally {
    server.close();
    await cacheService.invalidatePattern('GET:/api/*');
    await User.deleteMany({ email: { $in: [testEmail, testSrEmail] } });
    await Worker.deleteMany({ email: { $in: [testWorkerEmail, 'test_cache_worker2@example.com'] } });
    await Category.deleteMany({ name: { $in: ['CacheTestCat', 'CacheTestCat2'] } });
    await ServiceRequest.deleteMany({ categoryName: 'CacheTestCat' });
    await Blacklist.deleteMany({});
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests();