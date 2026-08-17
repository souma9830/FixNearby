import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Dispute from '../models/Dispute.js';
import Wallet from '../models/Wallet.js';
import AdminLog from '../models/AdminLog.js';
import disputeRoutes from '../routes/disputeRoutes.js';

const PORT = 5182;
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';

const app = express();
app.use(express.json());
app.use('/api/disputes', disputeRoutes);

let user;
let admin;
let stranger;
let worker;
let booking;
let dispute;

const sign = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
const request = (method, path, body, token) =>
  fetch(`http://127.0.0.1:${PORT}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  }).then(async (res) => ({ status: res.status, body: await res.json() }));

let failures = 0;
const assert = (cond, label, extra) => {
  if (cond) {
    console.log(`  OK   ${label}`);
  } else {
    failures++;
    console.error(`  FAIL ${label}${extra !== undefined ? ` -> ${JSON.stringify(extra).slice(0, 220)}` : ''}`);
  }
};

async function run() {
  console.log('=== DISPUTE RESOLUTION & MEDIATION PORTAL VERIFICATION ===');

  user = await User.create({
    name: 'Dispute Test User',
    email: `dispute-user-${Date.now()}@test.com`,
    password: 'password123',
    role: 'customer'
  });
  admin = await User.create({
    name: 'Dispute Admin',
    email: `dispute-admin-${Date.now()}@test.com`,
    password: 'password123',
    role: 'support'
  });
  worker = await Worker.create({
    name: 'Dispute Test Worker',
    email: `dispute-worker-${Date.now()}@test.com`,
    password: 'Password123',
    category: 'Plumbing',
    experience: '5 years',
    location: { type: 'Point', coordinates: [-73.9851, 40.7589] },
    contact: '1234567890',
    bio: 'Plumber bio info'
  });
  const userToken = sign(user._id);
  const adminToken = sign(admin._id);

  booking = await Booking.create({
    userId: user._id,
    workerId: worker._id,
    service: 'Plumbing Leak Fix',
    status: 'Completed',
    scheduledTime: new Date(Date.now() - 86400000),
    durationHours: 2,
    price: 150,
    address: '1 Test Ave, New York NY'
  });
  console.log('[1] File a dispute (evidence + claim amount)');
  const r1 = await request('POST', '/api/disputes', {
    bookingId: String(booking._id),
    reasonCategory: 'service_quality',
    description: 'Work was incomplete, leak still present after visit',
    claimAmount: 150,
    evidenceImages: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg']
  }, userToken);
  assert(r1.status === 201, `dispute filed (got ${r1.status})`, r1.body);
  assert(r1.body.dispute?.status === 'pending', 'initial status pending');
  assert(r1.body.dispute?.evidenceImages?.length === 2, 'evidence images attached');
  assert(r1.body.dispute?.reasonCategory === 'service_quality', 'reason category stored');
  dispute = r1.body.dispute;

  console.log('[2] Duplicate dispute for same booking rejected (400)');
  const r2 = await request('POST', '/api/disputes', {
    bookingId: String(booking._id),
    description: 'Second complaint attempt'
  }, userToken);
  assert(r2.status === 400, `duplicate blocked (got ${r2.status})`, r2.body);

  console.log('[3] Non-customer cannot file (403)');
  const stranger = await User.create({
    name: 'Stranger User',
    email: `dispute-stranger-${Date.now()}@test.com`,
    password: 'password123',
    role: 'customer'
  });
  const r3 = await request('POST', '/api/disputes', {
    bookingId: String(booking._id),
    description: 'Not my booking but filing anyway'
  }, sign(stranger._id));
  assert(r3.status === 403, `foreign booking blocked (got ${r3.status})`, r3.body);

  console.log('[4] Missing booking → 404');
  const r4 = await request('POST', '/api/disputes', { bookingId: String(new mongoose.Types.ObjectId()), description: 'ghost' }, userToken);
  assert(r4.status === 404, `unknown booking rejected (got ${r4.status})`, r4.body);

  console.log('[5] List disputes (filter by status)');
  const r5 = await request('GET', '/api/disputes?status=pending', null, adminToken);
  assert(r5.status === 200, `list ok (got ${r5.status})`, r5.body);
  assert(r5.body.count >= 1, 'pending disputes listed');
  assert(r5.body.disputes[0]?.bookingId, 'booking populated in list');

  console.log('[6] Unauthenticated access blocked (401)');
  const r6 = await request('GET', '/api/disputes', null, 'bad.token');
  assert(r6.status === 401, `unauthenticated blocked (got ${r6.status})`, r6.body);

  console.log('[7] Resolve as refund — wallet credited');
  const r7 = await request('PATCH', `/api/disputes/${dispute._id}/resolve`, {
    action: 'refund',
    notes: 'Full refund granted after evidence review'
  }, adminToken);
  assert(r7.status === 200, `resolve accepted (got ${r7.status})`, r7.body);
  assert(r7.body.dispute?.status === 'resolved_refund', 'status transitioned to resolved_refund');
  assert(r7.body.dispute?.resolutionOutcome?.refundAmount === 150, 'refund amount recorded');
  assert(r7.body.dispute?.resolvedByAdmin, 'admin attribution recorded');

  const wallet = await Wallet.findOne({ userId: user._id });
  assert(wallet && wallet.balance >= 150, `wallet credited ${wallet?.balance}`, wallet);

  console.log('[8] Status filter shows resolved');
  const r8 = await request('GET', '/api/disputes?status=resolved_refund', null, adminToken);
  assert(r8.status === 200 && r8.body.count >= 1, 'resolved disputes filterable', r8.body);

  console.log(`\nResult: ${failures === 0 ? 'ALL PASS' : `${failures} FAILURES`}`);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  const server = app.listen(PORT, async () => {
    try {
      await run();
    } catch (err) {
      console.error('[TEST ERROR]', err.message);
      failures = 1;
    } finally {
      await Promise.all([
        User.deleteMany({ _id: { $in: [user?._id, admin?._id, stranger?._id].filter(Boolean) } }),
        Worker.deleteMany({ _id: worker?._id }),
        Booking.deleteMany({ _id: booking?._id }),
        Dispute.deleteMany({ bookingId: booking?._id }),
        Wallet.deleteMany({ userId: user?._id }),
        AdminLog.deleteMany({})
      ]);
      console.log('[CLEANUP] Test records removed');
      server.close();
      await mongoose.disconnect();
      process.exit(failures === 0 ? 0 : 1);
    }
  });
})();