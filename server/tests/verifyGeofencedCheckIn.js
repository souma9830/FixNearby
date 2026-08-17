import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import JobTelemetry from '../models/JobTelemetry.js';
import telemetryRoutes from '../routes/telemetryRoutes.js';
import Blacklist from '../models/Blacklist.js';

const PORT = 5181;
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
const NY_COORDS = [-73.9851, 40.7589];

const app = express();
app.use(express.json());
app.use('/api/telemetry', telemetryRoutes);

let user;
let worker;
let stranger;
let booking;
let otherBooking;

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
  console.log('=== GEOFENCED CHECK-IN / TELEMETRY VERIFICATION ===');

  user = await User.create({
    name: 'Telemetry Test User',
    email: `telemetry-user-${Date.now()}@test.com`,
    password: 'password123',
    role: 'customer'
  });
  worker = await Worker.create({
    name: 'Telemetry Test Worker',
    email: `telemetry-worker-${Date.now()}@test.com`,
    password: 'Password123',
    category: 'Plumbing',
    experience: '5 years',
    location: { type: 'Point', coordinates: NY_COORDS },
    contact: '1234567890',
    bio: 'Plumber bio info'
  });
  const workerToken = sign(worker._id);

  booking = await Booking.create({
    userId: user._id,
    workerId: worker._id,
    service: 'Plumbing Leak Fix',
    location: { type: 'Point', coordinates: NY_COORDS },
    status: 'Pending',
    scheduledTime: new Date(Date.now() + 86400000),
    durationHours: 2,
    price: 120,
    address: '1 Test Ave, New York NY'
  });

  console.log('[1] Check-in inside geofence (~100m from target)');
  const nearCoords = [NY_COORDS[0] + 0.001, NY_COORDS[1]];
  const r1 = await request('POST', '/api/telemetry/check-in', { bookingId: String(booking._id), coordinates: nearCoords }, workerToken);
  assert(r1.status === 201, `check-in accepted (got ${r1.status})`, r1.body);
  assert(r1.body.success === true, 'success flag true');
  assert(r1.body.telemetry?.status === 'checked_in', 'telemetry persisted with checked_in status');
  assert(r1.body.telemetry?.distanceFromTargetMeters <= 500, `distance recorded <= 500m (got ${r1.body.telemetry?.distanceFromTargetMeters}m)`);

  const updatedBooking = await Booking.findById(booking._id);
  assert(updatedBooking.status === 'In-Progress', `booking transitioned to In-Progress (got ${updatedBooking.status})`);
  assert(updatedBooking.statusHistory.some((s) => s.status === 'In-Progress' && s.changedByModel === 'Worker'), 'statusHistory contains Worker entry');

  console.log('[2] Duplicate check-in rejected (409)');
  const r2 = await request('POST', '/api/telemetry/check-in', { bookingId: String(booking._id), coordinates: nearCoords }, workerToken);
  assert(r2.status === 409, `duplicate check-in rejected (got ${r2.status})`, r2.body);

  console.log('[3] Check-in outside geofence rejected (403 with distance)');
  const farCoords = [NY_COORDS[0] + 0.05, NY_COORDS[1]];
  otherBooking = await Booking.create({
    userId: user._id,
    workerId: worker._id,
    service: 'Electrical Panel Repair',
    location: { type: 'Point', coordinates: NY_COORDS },
    status: 'Pending',
    scheduledTime: new Date(Date.now() + 172800000),
    durationHours: 3,
    price: 200,
    address: '2 Test Ave, New York NY'
  });
  const r3 = await request('POST', '/api/telemetry/check-in', { bookingId: String(otherBooking._id), coordinates: farCoords }, workerToken);
  assert(r3.status === 403, `outside geofence rejected (got ${r3.status})`, r3.body);
  assert(r3.body.distanceMeters > 500, `distance over 500m reported (got ${r3.body.distanceMeters}m)`);
  assert(r3.body.geofenceRadiusMeters === 500, 'radius echoed in response');
  const farBooking = await Booking.findById(otherBooking._id);
  assert(farBooking.status === 'Pending', 'booking NOT started when outside geofence');

  console.log('[4] Unassigned worker rejected (403)');
  stranger = await Worker.create({
    name: 'Stranger Worker',
    email: `telemetry-stranger-${Date.now()}@test.com`,
    password: 'Password123',
    category: 'Electrical',
    experience: '3 years',
    location: { type: 'Point', coordinates: NY_COORDS },
    contact: '1234567891',
    bio: 'Electrician bio info'
  });
  const r4 = await request('POST', '/api/telemetry/check-in', { bookingId: String(booking._id), coordinates: nearCoords }, sign(stranger._id));
  assert(r4.status === 403, `unassigned worker blocked (got ${r4.status})`, r4.body);

  console.log('[5] Invalid payloads rejected');
  const r5a = await request('POST', '/api/telemetry/check-in', { coordinates: nearCoords }, workerToken);
  assert(r5a.status === 400, 'missing bookingId rejected', r5a.body);
  const r5b = await request('POST', '/api/telemetry/check-in', { bookingId: String(booking._id), coordinates: [-200, 90] }, workerToken);
  assert(r5b.status === 400, 'out-of-bounds coordinates rejected', r5b.body);
  const r5c = await request('POST', '/api/telemetry/check-in', { bookingId: String(booking._id), coordinates: [40.7] }, workerToken);
  assert(r5c.status === 400, 'malformed coordinates rejected', r5c.body);
  const r5d = await request('POST', '/api/telemetry/check-in', { bookingId: String(booking._id), coordinates: nearCoords }, 'garbage.token.value');
  assert(r5d.status === 401, 'invalid token rejected (401)', r5d.body);

  console.log('[6] Check-out records duration & coords');
  const r6 = await request('POST', '/api/telemetry/check-out', { bookingId: String(booking._id), coordinates: nearCoords }, workerToken);
  assert(r6.status === 200, `check-out accepted (got ${r6.status})`, r6.body);
  assert(r6.body.telemetry?.status === 'checked_out', 'telemetry marked checked_out');
  assert(r6.body.telemetry?.checkOutAt, 'checkOutAt timestamp recorded');
  assert(Number.isFinite(r6.body.telemetry?.durationMinutes), 'durationMinutes computed');
  assert(r6.body.telemetry?.checkOutCoordinates?.type === 'Point', 'check-out coordinates recorded');

  console.log('[7] Check-out without active check-in → 404');
  const r7 = await request('POST', '/api/telemetry/check-out', { bookingId: String(booking._id), coordinates: nearCoords }, workerToken);
  assert(r7.status === 404, `double check-out rejected (got ${r7.status})`, r7.body);

  console.log('[8] Telemetry history endpoint');
  const r8 = await request('GET', `/api/telemetry/${booking._id}`, null, workerToken);
  assert(r8.status === 200, `history fetch ok (got ${r8.status})`, r8.body);
  assert(Array.isArray(r8.body.telemetry) && r8.body.telemetry.length >= 1, 'history contains records');

  console.log('[9] Persistence');
  const count = await JobTelemetry.countDocuments({ bookingId: booking._id });
  assert(count >= 1, 'telemetry records persisted in MongoDB');

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
        User.deleteMany({ _id: user?._id }),
        Worker.deleteMany({ _id: { $in: [worker?._id, stranger?._id].filter(Boolean) } }),
        Booking.deleteMany({ _id: { $in: [booking?._id, otherBooking?._id].filter(Boolean) } }),
        JobTelemetry.deleteMany({ bookingId: booking?._id })
      ]);
      console.log('[CLEANUP] Test records removed');
      server.close();
      await mongoose.disconnect();
      process.exit(failures === 0 ? 0 : 1);
    }
  });
})();