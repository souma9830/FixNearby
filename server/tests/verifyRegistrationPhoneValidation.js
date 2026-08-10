import assert from 'node:assert/strict';
import { validateRegistration } from '../middleware/validationMiddleware.js';

const validBase = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password1!',
};

const invoke = (phone) => {
  let statusCode;
  let responseBody;
  let nextCalled = false;
  const req = { body: { ...validBase, phone } };
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

  validateRegistration(req, res, () => {
    nextCalled = true;
  });
  return { statusCode, responseBody, nextCalled };
};

for (const phone of ['12345', '12345678901', '123-456-7890', {}, null]) {
  assert.deepEqual(invoke(phone), {
    statusCode: 400,
    responseBody: { error: 'Phone number must contain exactly 10 digits.' },
    nextCalled: false,
  });
}

for (const phone of ['9876543210', '', undefined]) {
  assert.equal(invoke(phone).nextCalled, true);
}

console.log('Registration phone validation tests passed.');
