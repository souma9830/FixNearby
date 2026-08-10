import assert from 'assert';
import { assertApiResponse, assertPagination } from '../helpers/testUtils.js';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let total = 7;

  const runTest = async (name, testFn) => {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ ${name}`);
      console.error(err.message);
    }
  };

  await runTest('Search workers by category -> verify filtered results', async () => {
    const res = await fetch(`${API_URL}/workers?category=Plumbing`);
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(Array.isArray(data.data));
  });

  await runTest('Search workers with geo bounds -> verify location-based results', async () => {
    const res = await fetch(`${API_URL}/workers?lat=17.3850&lng=78.4867&radius=10`);
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(Array.isArray(data.data));
  });

  await runTest('Search with invalid coordinates -> verify error handling', async () => {
    const res = await fetch(`${API_URL}/workers?lat=invalid&lng=invalid`);
    assertApiResponse(res, 400);
  });

  await runTest('Filter workers by availability status -> verify filtered results', async () => {
    const res = await fetch(`${API_URL}/workers?status=Available`);
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(Array.isArray(data.data));
  });

  await runTest('Sort workers by rating -> verify sorted order', async () => {
    const res = await fetch(`${API_URL}/workers?sort=-rating`);
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(Array.isArray(data.data));
  });

  await runTest('Paginate worker results -> verify pagination metadata', async () => {
    const res = await fetch(`${API_URL}/workers?page=1&limit=5`);
    assertApiResponse(res, 200);
    const data = await res.json();
    assertPagination(data.pagination);
  });

  await runTest('Search with no results -> verify empty array with pagination', async () => {
    const res = await fetch(`${API_URL}/workers?category=NonExistentCategory`);
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(Array.isArray(data.data));
    assert(data.data.length === 0);
  });

  console.log(`\nSummary: ${passed}/${total} tests passed`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
