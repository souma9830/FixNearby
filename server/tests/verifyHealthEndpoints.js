import assert from 'node:assert/strict';
import { createHealthHandlers } from '../controllers/healthController.js';

const invoke = (handler) => {
  let statusCode;
  let body;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
  };
  handler({}, res);
  return { statusCode, body };
};

const connected = createHealthHandlers({ connection: { readyState: 1 }, startedAt: Date.now() - 2000 });
assert.equal(invoke(connected.live).statusCode, 200);
assert.equal(invoke(connected.ready).statusCode, 200);
assert.equal(invoke(connected.ready).body.dependencies.mongodb, 'connected');

const disconnected = createHealthHandlers({ connection: { readyState: 0 } });
const unavailable = invoke(disconnected.ready);
assert.equal(unavailable.statusCode, 503);
assert.equal(unavailable.body.status, 'not_ready');
assert.equal(unavailable.body.dependencies.mongodb, 'disconnected');

console.log('Health endpoint tests passed.');
