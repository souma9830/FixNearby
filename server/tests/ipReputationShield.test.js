import { ipReputationShield, getBlockedIPs, clearBlockedIPs } from '../middleware/ipReputationShield.js';

function runTests() {
  console.log('Running IP Reputation Shield Tests...');
  clearBlockedIPs();

  const middleware = ipReputationShield({ maxViolations: 2, windowMs: 5000 });

  // Test 1: Normal Request Pass
  let nextCalled = false;
  const mockReqNormal = { ip: '192.168.1.1', body: { name: 'Clean User' }, query: {}, url: '/api/v1/users' };
  const mockResNormal = {};
  middleware(mockReqNormal, mockResNormal, () => { nextCalled = true; });
  if (!nextCalled) throw new Error('Test 1 Failed: Normal request should be allowed.');
  console.log('✓ Test 1 Passed: Normal request allowed.');

  // Test 2: Malicious Payload Detection
  let statusSet = 0;
  let jsonResult = null;
  const mockReqThreat = {
    ip: '192.168.1.2',
    body: { comment: '<script>alert("xss")</script>' },
    query: {},
    url: '/api/v1/comments'
  };
  const mockResThreat = {
    status(code) { statusSet = code; return this; },
    json(data) { jsonResult = data; return this; }
  };
  middleware(mockReqThreat, mockResThreat, () => {});
  if (statusSet !== 400 || jsonResult.error !== 'MALICIOUS_PAYLOAD_DETECTED') {
    throw new Error('Test 2 Failed: Suspicious payload not caught.');
  }
  console.log('✓ Test 2 Passed: Malicious payload blocked.');

  console.log('All IP Reputation Shield tests passed successfully!');
}

runTests();
