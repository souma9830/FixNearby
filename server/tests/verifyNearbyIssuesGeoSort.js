import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Issue from '../models/Issue.js';
import { getNearbyIssues } from '../controllers/issueController.js';

dotenv.config();

const TEST_PREFIX = 'test-issue-931-';

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runTests = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    if (!mongoose.connection.readyState) {
      console.error('Failed to establish database connection. Exiting.');
      process.exit(1);
    }

    console.log('Cleaning up old test data...');
    await Issue.deleteMany({ title: new RegExp('^' + TEST_PREFIX) });

    // Ensure the 2dsphere index exists (fresh test DBs need it before $geoNear)
    await Issue.createIndexes();

    const mkIssue = (title, lat, lng, upvotes, category) =>
      Issue.create({
        title,
        description: 'Test description for geospatial nearby-issue verification.',
        category,
        latitude: lat,
        longitude: lng,
        location: { type: 'Point', coordinates: [lng, lat] },
        upvotes
      });

    console.log('Creating test issues at known coordinate points...');
    // Base center: San Francisco (37.7749, -122.4194)
    await mkIssue(`${TEST_PREFIX}center-low`, 37.7749, -122.4194, 5, 'Pothole');
    await mkIssue(`${TEST_PREFIX}center-high`, 37.7749, -122.4194, 50, 'Pothole');
    await mkIssue(`${TEST_PREFIX}far`, 37.7749, -122.4394, 100, 'Pothole');
    await mkIssue(`${TEST_PREFIX}other-cat`, 37.7749, -122.4194, 99, 'Graffiti');
    console.log('Seeded test issues successfully.');

    console.log('\n--- Test 1: nearby issues return 200 without planner error ---');
    const req1 = {
      query: { lat: '37.7749', lng: '-122.4194', radius: '15', zoom: '15' }
    };
    const res1 = mockResponse();
    await getNearbyIssues(req1, res1);

    if (res1.statusCode !== 200 || !res1.body || !Array.isArray(res1.body.data)) {
      console.error('FAIL: getNearbyIssues did not return { type: "list", data: [...] }');
      console.error(res1.body);
      process.exit(1);
    }
    console.log(`SUCCESS: got ${res1.body.data.length} nearby issues (no planner error).`);

    console.log('\n--- Test 2: nearest first, then upvotes desc ---');
    const names = res1.body.data.map((i) => i.title);
    // All seeded issues except "far" sit at the center (distance 0), so at equal
    // distance the 99-upvote Graffiti issue ranks first, then 50, then 5.
    const expectOrder = [
      `${TEST_PREFIX}other-cat`,
      `${TEST_PREFIX}center-high`,
      `${TEST_PREFIX}center-low`,
      `${TEST_PREFIX}far`
    ];
    if (names.join('|') !== expectOrder.join('|')) {
      console.error('FAIL: expected order', expectOrder);
      console.error('got          ', names);
      process.exit(1);
    }
    console.log('SUCCESS: distance-first, then upvotes ordering verified.');

    console.log('\n--- Test 3: category filter applied ---');
    const req3 = {
      query: { lat: '37.7749', lng: '-122.4194', radius: '15', zoom: '15', category: 'Graffiti' }
    };
    const res3 = mockResponse();
    await getNearbyIssues(req3, res3);
    const cats = res3.body.data.map((i) => i.category);
    if (res3.statusCode !== 200 || cats.length === 0 || cats.some((c) => c !== 'Graffiti')) {
      console.error('FAIL: category filter not honored:', cats);
      process.exit(1);
    }
    console.log(`SUCCESS: category filter returned ${cats.length} Graffiti issues.`);

    console.log('\n--- Test 4: missing coords falls back to top issues ---');
    const req4 = { query: { zoom: '15' } };
    const res4 = mockResponse();
    await getNearbyIssues(req4, res4);
    if (res4.statusCode !== 200 || res4.body.type !== 'list' || !Array.isArray(res4.body.data)) {
      console.error('FAIL: fallback path broken:', res4.body);
      process.exit(1);
    }
    console.log(`SUCCESS: fallback returned ${res4.body.data.length} top issues.`);

    console.log('\n--- CLEANING UP ---');
    await Issue.deleteMany({ title: new RegExp('^' + TEST_PREFIX) });
    console.log('Cleanup completed.');

    console.log('\n=============================================');
    console.log('ALL NEARBY ISSUES ($geoNear SORT) TESTS PASSED!');
    console.log('=============================================');

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nXXX NEARBY ISSUES TEST ENCOUNTERED ERROR XXX');
    console.error(error);
    mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
