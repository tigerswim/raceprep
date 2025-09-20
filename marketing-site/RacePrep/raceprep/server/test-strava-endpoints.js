#!/usr/bin/env node

/**
 * Test script for enhanced Strava API endpoints
 * Run with: node test-strava-endpoints.js
 */

const BASE_URL = 'http://localhost:3001/api';

// Mock access token for testing (replace with real token for actual testing)
const MOCK_TOKEN = 'test_access_token_12345';

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${url}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);

    if (response.ok) {
      console.log(`   ✅ ${name} endpoint is working`);
    } else {
      console.log(`   ⚠️  ${name} returned error (expected for mock data)`);
    }
  } catch (error) {
    console.log(`   ❌ ${name} failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Enhanced Strava API Endpoints\n');

  // Test health check first
  await testEndpoint(
    'Health Check',
    `${BASE_URL.replace('/api', '')}/health`
  );

  // Test Strava activities endpoint
  await testEndpoint(
    'Strava Activities',
    `${BASE_URL}/strava/activities?access_token=${MOCK_TOKEN}&per_page=10`
  );

  // Test weekly analytics
  await testEndpoint(
    'Weekly Analytics',
    `${BASE_URL}/strava/analytics/weekly?access_token=${MOCK_TOKEN}&weeks=4`
  );

  // Test monthly analytics
  await testEndpoint(
    'Monthly Analytics',
    `${BASE_URL}/strava/analytics/monthly?access_token=${MOCK_TOKEN}&months=3`
  );

  // Test sync progress (POST)
  await testEndpoint(
    'Sync Progress Start',
    `${BASE_URL}/strava/sync/progress`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: MOCK_TOKEN,
        sync_id: 'test_sync_12345'
      })
    }
  );

  // Test sync status
  await testEndpoint(
    'Sync Status',
    `${BASE_URL}/strava/sync/status/test_sync_12345`
  );

  // Test token refresh (POST)
  await testEndpoint(
    'Token Refresh',
    `${BASE_URL}/strava/refresh`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: 'mock_refresh_token'
      })
    }
  );

  // Test rate limiting by making multiple rapid requests
  console.log('\n🔄 Testing Rate Limiting...');
  for (let i = 0; i < 3; i++) {
    await testEndpoint(
      `Rate Limit Test ${i + 1}`,
      `${BASE_URL}/strava/activities?access_token=${MOCK_TOKEN}&per_page=5`
    );
  }

  console.log('\n✨ Test complete! Check the output above for any issues.');
  console.log('\n📋 Summary of new features:');
  console.log('   • Enhanced error handling with retry logic');
  console.log('   • Rate limiting for all Strava endpoints');
  console.log('   • Weekly and monthly analytics endpoints');
  console.log('   • Sync progress tracking');
  console.log('   • Improved data transformation and validation');
  console.log('   • Comprehensive API documentation');
}

// Check if running directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };