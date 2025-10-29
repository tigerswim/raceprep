#!/usr/bin/env node

/**
 * Test Environment Variables & API Connections
 * This script verifies that all API credentials are properly configured
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

console.log('\n' + '='.repeat(60));
log('🧪 RacePrep Environment & API Connection Tests', 'blue');
console.log('='.repeat(60) + '\n');

// 1. Check Environment Variables
log('📋 Step 1: Checking Environment Variables...', 'blue');
console.log('');

const requiredVars = {
  'EXPO_PUBLIC_SUPABASE_URL': process.env.EXPO_PUBLIC_SUPABASE_URL,
  'EXPO_PUBLIC_SUPABASE_ANON_KEY': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

const optionalVars = {
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'EXPO_PUBLIC_RUNSIGNUP_API_KEY': process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY,
  'EXPO_PUBLIC_RUNSIGNUP_API_SECRET': process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET,
  'EXPO_PUBLIC_STRAVA_CLIENT_ID': process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID,
  'EXPO_PUBLIC_STRAVA_CLIENT_SECRET': process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET,
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY': process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  'EXPO_PUBLIC_OPENWEATHERMAP_API_KEY': process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY,
};

// Check required variables
for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value.includes('YOUR_') || value.includes('your-')) {
    log(`  ✗ ${key}: MISSING OR NOT CONFIGURED`, 'red');
    results.failed++;
  } else {
    log(`  ✓ ${key}: Configured`, 'green');
    results.passed++;
  }
}

// Check optional variables
for (const [key, value] of Object.entries(optionalVars)) {
  if (!value || value.includes('YOUR_') || value.includes('your-')) {
    log(`  ⚠ ${key}: Not configured (optional)`, 'yellow');
    results.warnings++;
  } else {
    log(`  ✓ ${key}: Configured`, 'green');
    results.passed++;
  }
}

console.log('');

// 2. Test Supabase Connection
log('🔗 Step 2: Testing Supabase Connection...', 'blue');
console.log('');

function testSupabase() {
  return new Promise((resolve) => {
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      log('  ✗ Supabase: Cannot test - credentials missing', 'red');
      results.failed++;
      resolve();
      return;
    }

    const url = new URL('/rest/v1/', process.env.EXPO_PUBLIC_SUPABASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        log(`  ✓ Supabase: Connected successfully (${res.statusCode})`, 'green');
        results.passed++;
      } else {
        log(`  ✗ Supabase: Connection failed (Status: ${res.statusCode})`, 'red');
        results.failed++;
      }
      resolve();
    });

    req.on('error', (error) => {
      log(`  ✗ Supabase: Connection error - ${error.message}`, 'red');
      results.failed++;
      resolve();
    });

    req.setTimeout(5000, () => {
      log('  ✗ Supabase: Connection timeout', 'red');
      results.failed++;
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// 3. Test OpenWeatherMap API
function testOpenWeatherMap() {
  return new Promise((resolve) => {
    if (!process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY ||
        process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY.includes('your-')) {
      log('  ⚠ OpenWeatherMap: Skipped - API key not configured', 'yellow');
      results.warnings++;
      resolve();
      return;
    }

    const options = {
      hostname: 'api.openweathermap.org',
      path: `/data/2.5/weather?q=Atlanta&appid=${process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        log('  ✓ OpenWeatherMap: API key valid', 'green');
        results.passed++;
      } else {
        log(`  ✗ OpenWeatherMap: API key invalid (Status: ${res.statusCode})`, 'red');
        results.failed++;
      }
      resolve();
    });

    req.on('error', (error) => {
      log(`  ✗ OpenWeatherMap: Connection error - ${error.message}`, 'red');
      results.failed++;
      resolve();
    });

    req.setTimeout(5000, () => {
      log('  ✗ OpenWeatherMap: Connection timeout', 'red');
      results.failed++;
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  await testSupabase();

  console.log('');
  log('🌤️  Step 3: Testing OpenWeatherMap API...', 'blue');
  console.log('');
  await testOpenWeatherMap();

  // Summary
  console.log('');
  console.log('='.repeat(60));
  log('📊 Test Summary', 'blue');
  console.log('='.repeat(60));
  console.log('');
  log(`  ✓ Passed:   ${results.passed}`, 'green');
  log(`  ✗ Failed:   ${results.failed}`, 'red');
  log(`  ⚠ Warnings: ${results.warnings}`, 'yellow');
  console.log('');

  if (results.failed === 0 && results.passed > 0) {
    log('🎉 All critical tests passed! Your environment is properly configured.', 'green');
  } else if (results.failed > 0) {
    log('⚠️  Some tests failed. Please check the configuration above.', 'yellow');
  } else {
    log('❌ No valid configurations found. Please update your .env.local file.', 'red');
  }
  console.log('');
}

runTests();
