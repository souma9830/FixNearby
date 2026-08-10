import assert from 'node:assert/strict';
import { updateUserProfile } from '../controllers/authController.js';

const invalidPasswords = ['short', 'alllowercase1', 'ALLUPPERCASE1', 'NoNumber', []];

for (const password of invalidPasswords) {
  let statusCode;
  let responseBody;
  const req = {
    user: { _id: '507f1f77bcf86cd799439011' },
    body: { password },
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      responseBody = payload;
      return this;
    },
  };

  await updateUserProfile(req, res);

  assert.equal(statusCode, 400);
  assert.deepEqual(responseBody, {
    message: 'Password must contain uppercase, lowercase and a number and be at least 6 characters long',
  });
}

console.log('Profile password policy tests passed.');
process.exit(0);
