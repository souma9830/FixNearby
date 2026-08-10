import assert from "node:assert/strict";
import { loginWorker } from "../controllers/workerController.js";

const invalidCredentials = [
  { email: null, password: "Password1!" },
  { email: "worker@example.com" },
  { email: {}, password: "Password1!" },
  { email: "worker@example.com", password: [] },
  { email: "   ", password: "Password1!" },
];

for (const body of invalidCredentials) {
  let statusCode;
  let responseBody;

  const req = { body };
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

  await loginWorker(req, res);

  assert.equal(statusCode, 400);
  assert.deepEqual(responseBody, {
    success: false,
    message: "Please provide an email and password",
  });
}

console.log("Worker login credential validation tests passed.");
