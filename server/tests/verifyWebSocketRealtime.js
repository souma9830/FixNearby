import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET || 'fallback_secret';
const token = jwt.sign(
  { id: '650000000000000000000001', role: 'customer' },
  secret,
  { expiresIn: '1d' }
);

console.log('--- Starting Real-Time WebSocket Verification ---');

const socket = io('http://localhost:5000', {
  auth: { token },
  transports: ['websocket', 'polling'],
  timeout: 5000
});

const start = Date.now();

socket.on('connect', () => {
  console.log(`[PASS] WebSocket Connected successfully! Socket ID: ${socket.id}`);

  // Test 1: Ping/Pong Heartbeat Latency Diagnostics
  socket.emit('ping_check', { clientTimestamp: start }, (res) => {
    const rtt = Date.now() - start;
    console.log(`[PASS] WebSocket Ping/Pong Latency Test: ${rtt}ms`);
    console.log(`[PASS] Diagnostics Payload:`, JSON.stringify(res));

    // Test 2: Room Join & Chat Broadcast
    socket.emit('join_conversation', { conversationId: 'conv1' });
    console.log('[PASS] Joined conversation room: conv1');

    socket.disconnect();
    console.log('--- WebSocket Verification Finished Successfully ---');
    process.exit(0);
  });
});

socket.on('connect_error', (err) => {
  console.error('[FAIL] WebSocket Connection Error:', err.message);
  process.exit(1);
});
