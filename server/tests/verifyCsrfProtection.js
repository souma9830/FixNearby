import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { csrfProtection } from '../middleware/csrfMiddleware.js';

dotenv.config();

const PORT = 5561;

async function runTests() {
  console.log('--- STARTING CSRF DOUBLE-SUBMIT PROTECTION TESTS ---');

  const app = express();
  app.use(express.json());
  
  // Apply CSRF Protection middleware globally for tests
  app.use(csrfProtection);

  app.get('/api/test-get', (req, res) => {
    res.status(200).json({ success: true, method: 'GET' });
  });

  app.post('/api/test-post', (req, res) => {
    res.status(200).json({ success: true, method: 'POST' });
  });

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    // 1. Verify GET requests are bypassed (safe method)
    console.log('\nTest 1: Executing GET request without CSRF token (should pass)...');
    const getRes = await fetch(`http://localhost:${PORT}/api/test-get`);
    const getBody = await getRes.json();
    console.log(`- Status: ${getRes.status}, Body: ${JSON.stringify(getBody)}`);
    if (getRes.status !== 200 || !getBody.success) {
      throw new Error('GET request failed.');
    }
    console.log('SUCCESS: GET request bypass verified.');

    // Extract CSRF cookie set by server
    const cookiesHeader = getRes.headers.get('set-cookie');
    console.log(`- Received set-cookie header: "${cookiesHeader}"`);
    let csrfToken = '';
    if (cookiesHeader) {
      const match = cookiesHeader.match(/csrf-token=([^;]+)/);
      if (match) csrfToken = match[1];
    }
    console.log(`- Extracted CSRF Token: ${csrfToken}`);

    // 2. Verify POST request fails without X-CSRF-Token header
    console.log('\nTest 2: Executing POST request without X-CSRF-Token header (should fail with 403)...');
    const postNoHeaderRes = await fetch(`http://localhost:${PORT}/api/test-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `csrf-token=${csrfToken}`
      },
      body: JSON.stringify({ data: 'test' })
    });
    const postNoHeaderBody = await postNoHeaderRes.json();
    console.log(`- Status: ${postNoHeaderRes.status}, Body: ${JSON.stringify(postNoHeaderBody)}`);
    if (postNoHeaderRes.status !== 403 || postNoHeaderBody.message !== 'CSRF token validation failed') {
      throw new Error('POST request should have failed with 403 CSRF validation error.');
    }
    console.log('SUCCESS: Request without matching header token rejected.');

    // 3. Verify POST request succeeds with matching CSRF cookie and X-CSRF-Token header
    console.log('\nTest 3: Executing POST request with matching CSRF header and cookie (should succeed)...');
    const postSuccessRes = await fetch(`http://localhost:${PORT}/api/test-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `csrf-token=${csrfToken}`,
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify({ data: 'test' })
    });
    const postSuccessBody = await postSuccessRes.json();
    console.log(`- Status: ${postSuccessRes.status}, Body: ${JSON.stringify(postSuccessBody)}`);
    if (postSuccessRes.status !== 200 || !postSuccessBody.success) {
      throw new Error('POST request with valid double-submit tokens failed.');
    }
    console.log('SUCCESS: Double-submit validation passed.');

    console.log('\n=============================================');
    console.log('ALL CSRF PROTECTION TESTS PASSED!');
    console.log('=============================================');

  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error);
    process.exit(1);
  } finally {
    server.close(() => {
      console.log('Test server closed.');
      setTimeout(() => {
        process.exit(0);
      }, 100);
    });
  }
}

runTests();
