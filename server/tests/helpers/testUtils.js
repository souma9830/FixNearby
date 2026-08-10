import jwt from 'jsonwebtoken';
import assert from 'assert';

export const generateTestUser = (overrides = {}) => {
  const ts = Date.now();
  return {
    name: `User${ts}`,
    email: `user${ts}@example.com`,
    password: 'password123',
    phone: `9876543${ts.toString().slice(-3)}`,
    ...overrides
  };
};

export const generateTestWorker = (overrides = {}) => {
  const ts = Date.now();
  return {
    name: `Worker${ts}`,
    email: `worker${ts}@example.com`,
    password: 'password123',
    category: 'Plumbing',
    experience: 5,
    contact: `9876543${ts.toString().slice(-3)}`,
    bio: 'Test bio',
    location: { type: 'Point', coordinates: [78.4867, 17.3850] },
    ...overrides
  };
};

export const generateTestBooking = (userId, workerId, overrides = {}) => {
  return {
    userId,
    workerId,
    service: 'Plumbing fix',
    scheduledTime: new Date(Date.now() + 86400000).toISOString(),
    durationHours: 2,
    address: 'Test Address 123',
    price: 500,
    status: 'Pending',
    ...overrides
  };
};

export const generateAuthToken = (user) => {
  const id = user._id || user.id || 'dummy_id';
  return jwt.sign({ id }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1d' });
};

export const assertApiResponse = (response, expectedStatus) => {
  assert.strictEqual(response.status, expectedStatus, `Expected status ${expectedStatus} but got ${response.status}`);
};

export const assertPagination = (data) => {
  assert(data.page !== undefined, 'Missing page in pagination');
  assert(data.limit !== undefined, 'Missing limit in pagination');
  assert(data.total !== undefined, 'Missing total in pagination');
  assert(data.totalPages !== undefined, 'Missing totalPages in pagination');
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    ...overrides
  };
};

export const createMockResponse = () => {
  const res = {
    _status: 200,
    _data: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(data) {
      this._data = data;
      return this;
    },
    send(data) {
      this._data = data;
      return this;
    }
  };
  return res;
};
