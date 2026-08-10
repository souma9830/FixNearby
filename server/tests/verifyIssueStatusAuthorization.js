import assert from 'node:assert/strict';
import { updateIssueStatus } from '../controllers/issueController.js';

const invoke = async ({ user, body }) => {
  let statusCode;
  let responseBody;

  const req = {
    params: { id: '507f1f77bcf86cd799439011' },
    body,
    user,
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

  await updateIssueStatus(req, res);
  return { statusCode, responseBody };
};

const unauthorizedCases = [
  undefined,
  { role: 'customer' },
  { role: 'worker' },
];

for (const user of unauthorizedCases) {
  const result = await invoke({ user, body: { status: 'resolved' } });
  assert.deepEqual(result, {
    statusCode: 403,
    responseBody: {
      success: false,
      message: 'Support role required',
    },
  });
}

const invalidStatus = await invoke({
  user: { role: 'support' },
  body: { status: 'deleted' },
});

assert.deepEqual(invalidStatus, {
  statusCode: 400,
  responseBody: {
    success: false,
    message: 'Invalid status value',
  },
});

console.log('Issue status authorization tests passed.');
process.exit(0);
