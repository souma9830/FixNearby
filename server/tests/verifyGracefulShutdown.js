import assert from 'node:assert/strict';
import { createGracefulShutdown } from '../utils/gracefulShutdown.js';

let serverCloseCount = 0;
let databaseCloseCount = 0;
const exitCodes = [];

const shutdown = createGracefulShutdown({
  server: {
    close(callback) {
      serverCloseCount += 1;
      callback();
    },
  },
  closeDatabase: async () => {
    databaseCloseCount += 1;
  },
  exit: (code) => exitCodes.push(code),
  logger: { info() {}, error() {} },
  timeoutMs: 100,
});

const first = shutdown('SIGTERM');
const second = shutdown('SIGINT');
assert.equal(first, second);
assert.equal(await first, 0);
assert.equal(serverCloseCount, 1);
assert.equal(databaseCloseCount, 1);
assert.deepEqual(exitCodes, [0]);

console.log('Graceful shutdown tests passed.');
