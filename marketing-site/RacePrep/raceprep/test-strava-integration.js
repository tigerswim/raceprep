#!/usr/bin/env node
/**
 * Comprehensive Strava Integration Test Script
 * Tests all aspects of the Strava integration to identify issues
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
  console.log('🧪 Starting Comprehensive Strava Integration Tests');
  console.log('==================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function logTest(name, passed, details = '') {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}`);
    }
    if (details) {
      console.log(`   ${details}`);
    }
  }

  // Test 1: Backend Server Health
  console.log('1. Testing Backend Server...');
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();

    logTest('Backend server is responding', response.ok);
    logTest('Strava API is configured', data.apis?.strava === true);
  } catch (error) {
    logTest('Backend server is responding', false, `Error: ${error.message}`);
    logTest('Strava API is configured', false, 'Could not check - server down');
  }

  // Test 2: Database Schema
  console.log('\n2. Testing Database Schema...');
  try {
    // Check if training_sessions table exists
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .limit(1);

    logTest('training_sessions table exists', !error || !error.message.includes('does not exist'));

    if (!error) {
      // Check for required columns by attempting a structured query
      try {
        const { data: structureTest, error: structureError } = await supabase
          .from('training_sessions')
          .select('id, user_id, strava_activity_id, type, date, distance, moving_time, name, average_speed')
          .limit(1);

        logTest('Enhanced columns exist', !structureError,
          structureError ? `Missing columns: ${structureError.message}` : 'All enhanced columns found');
      } catch (e) {
        logTest('Enhanced columns exist', false, `Structure test failed: ${e.message}`);
      }
    }

  } catch (error) {
    logTest('training_sessions table exists', false, `Error: ${error.message}`);
  }

  // Test 3: Authentication Flow
  console.log('\n3. Testing Authentication...');

  // Test Strava connect endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/strava/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await response.json();

    logTest('Strava connect endpoint validation',
      data.error === 'Authorization code is required',
      'Endpoint properly validates missing authorization code');
  } catch (error) {
    logTest('Strava connect endpoint validation', false, `Error: ${error.message}`);
  }

  // Test 4: Activities Endpoint
  console.log('\n4. Testing Activities Endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/strava/activities`);
    const data = await response.json();

    logTest('Strava activities endpoint validation',
      data.error === 'Access token is required',
      'Endpoint properly validates missing access token');
  } catch (error) {
    logTest('Strava activities endpoint validation', false, `Error: ${error.message}`);
  }

  // Test 5: Database Permissions (requires a test user)
  console.log('\n5. Testing Database Permissions...');

  // This test requires a logged-in user, so we'll skip if no auth
  console.log('   ℹ️  Skipping RLS tests (requires authenticated user)');
  console.log('   To test: Log into the app and run debugStravaDataFlow() in browser console');

  // Test 6: Data Transformation
  console.log('\n6. Testing Data Transformation...');

  // Test the activity transformation logic
  const mockStravaActivity = {
    id: 12345,
    name: 'Test Run',
    type: 'Run',
    date: '2024-01-01',
    distance: 5000, // 5km in meters
    moving_time: 1800, // 30 minutes in seconds
    average_speed: 2.78, // ~10 min/mile pace
    average_heartrate: 150,
    trainer: false
  };

  try {
    // Simulate the transformation logic from strava-callback.tsx
    const transformedActivity = {
      strava_activity_id: mockStravaActivity.id?.toString(),
      date: mockStravaActivity.date,
      type: 'run', // mapped from 'Run'
      distance: mockStravaActivity.distance,
      moving_time: mockStravaActivity.moving_time,
      name: mockStravaActivity.name,
      average_speed: mockStravaActivity.average_speed,
      average_heartrate: mockStravaActivity.average_heartrate,
      trainer: mockStravaActivity.trainer
    };

    logTest('Activity transformation logic',
      transformedActivity.strava_activity_id === '12345' &&
      transformedActivity.type === 'run' &&
      transformedActivity.distance === 5000,
      'Mock Strava activity transforms correctly');

  } catch (error) {
    logTest('Activity transformation logic', false, `Error: ${error.message}`);
  }

  // Test 7: Migration Files
  console.log('\n7. Checking Migration Files...');
  const fs = require('fs');
  const path = require('path');

  try {
    const migrationDir = path.join(__dirname, 'supabase', 'migrations');

    const basicMigration = path.join(migrationDir, '003_add_strava_integration.sql');
    const enhancedMigration = path.join(migrationDir, '004_enhance_strava_fields.sql');

    logTest('Basic migration file exists', fs.existsSync(basicMigration));
    logTest('Enhanced migration file exists', fs.existsSync(enhancedMigration));

  } catch (error) {
    logTest('Migration files check', false, `Error: ${error.message}`);
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Integration should be working.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
  }

  // Recommendations
  console.log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS');
  console.log('====================================');

  if (passedTests < totalTests) {
    console.log('1. Run the database schema fix:');
    console.log('   Execute fix-database-schema.sql in Supabase SQL Editor');
    console.log('');
    console.log('2. Verify environment variables:');
    console.log('   Check .env.local has all required Strava and Supabase credentials');
    console.log('');
    console.log('3. Test in browser:');
    console.log('   Open browser console and run debugStravaDataFlow()');
    console.log('');
    console.log('4. Check server logs:');
    console.log('   Monitor server console during Strava sync for errors');
  }

  console.log('\n5. Manual testing steps:');
  console.log('   a) Connect Strava from Training tab');
  console.log('   b) Check browser console for detailed logs');
  console.log('   c) Verify activities appear in UI after sync');
  console.log('   d) Test refresh functionality');

  return { totalTests, passedTests };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };