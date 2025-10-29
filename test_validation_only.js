// Simple validation test without database connection

const validateRaceData = (raceData) => {
  const errors = [];

  // Required fields
  if (!raceData.name || raceData.name.trim().length === 0) {
    errors.push('Race name is required');
  } else if (raceData.name.trim().length > 200) {
    errors.push('Race name must be less than 200 characters');
  }

  if (!raceData.date) {
    errors.push('Race date is required');
  } else {
    const raceDate = new Date(raceData.date);
    const today = new Date();
    const fiveYearsAgo = new Date();
    const tenYearsFromNow = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);
    tenYearsFromNow.setFullYear(today.getFullYear() + 10);

    if (isNaN(raceDate.getTime())) {
      errors.push('Invalid date format');
    } else if (raceDate < fiveYearsAgo) {
      errors.push('Race date cannot be more than 5 years in the past');
    } else if (raceDate > tenYearsFromNow) {
      errors.push('Race date cannot be more than 10 years in the future');
    }
  }

  if (!raceData.location || raceData.location.trim().length === 0) {
    errors.push('Race location is required');
  } else if (raceData.location.trim().length > 200) {
    errors.push('Location must be less than 200 characters');
  }

  if (!raceData.distance_type) {
    errors.push('Distance type is required');
  } else if (!['sprint', 'olympic', 'half', 'ironman', 'custom'].includes(raceData.distance_type)) {
    errors.push('Invalid distance type');
  }

  // Optional field validations
  if (raceData.swim_distance !== undefined && raceData.swim_distance !== null) {
    if (raceData.swim_distance < 0 || raceData.swim_distance > 10000) {
      errors.push('Swim distance must be between 0 and 10,000 meters');
    }
  }

  if (raceData.bike_distance !== undefined && raceData.bike_distance !== null) {
    if (raceData.bike_distance < 0 || raceData.bike_distance > 300) {
      errors.push('Bike distance must be between 0 and 300 kilometers');
    }
  }

  if (raceData.run_distance !== undefined && raceData.run_distance !== null) {
    if (raceData.run_distance < 0 || raceData.run_distance > 50) {
      errors.push('Run distance must be between 0 and 50 kilometers');
    }
  }

  if (raceData.difficulty_score !== undefined && raceData.difficulty_score !== null) {
    if (!Number.isInteger(raceData.difficulty_score) || raceData.difficulty_score < 1 || raceData.difficulty_score > 10) {
      errors.push('Difficulty score must be an integer between 1 and 10');
    }
  }

  if (raceData.description && raceData.description.length > 1000) {
    errors.push('Description must be less than 1,000 characters');
  }

  if (raceData.website_url) {
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(raceData.website_url)) {
      errors.push('Website URL must be a valid HTTP or HTTPS URL');
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join('; ') : null,
    errors
  };
};

console.log('🧪 Testing user race validation...');

const testRace = {
  name: 'Test Sprint Triathlon',
  date: '2024-12-15',
  location: 'Test Lake Park',
  distance_type: 'sprint',
  swim_distance: 750,
  bike_distance: 20,
  run_distance: 5,
  difficulty_score: 6,
  description: 'A test race for validating the system',
  website_url: 'https://example.com/test-race'
};

// Test 1: Valid data
console.log('\n✅ Testing valid data...');
const validTest = validateRaceData(testRace);
if (validTest.isValid) {
  console.log('   ✓ Valid race data accepted correctly');
} else {
  console.log('   ❌ Valid data was rejected:', validTest.error);
}

// Test 2: Missing name
console.log('\n✅ Testing missing name...');
const noNameTest = validateRaceData({ ...testRace, name: '' });
if (!noNameTest.isValid && noNameTest.error.includes('name is required')) {
  console.log('   ✓ Missing name properly rejected');
} else {
  console.log('   ❌ Missing name test failed');
}

// Test 3: Invalid distance type
console.log('\n✅ Testing invalid distance type...');
const invalidDistanceTest = validateRaceData({ ...testRace, distance_type: 'marathon' });
if (!invalidDistanceTest.isValid && invalidDistanceTest.error.includes('Invalid distance type')) {
  console.log('   ✓ Invalid distance type properly rejected');
} else {
  console.log('   ❌ Invalid distance type test failed');
}

// Test 4: Invalid URL
console.log('\n✅ Testing invalid URL...');
const invalidUrlTest = validateRaceData({ ...testRace, website_url: 'not-a-url' });
if (!invalidUrlTest.isValid && invalidUrlTest.error.includes('valid HTTP or HTTPS URL')) {
  console.log('   ✓ Invalid URL properly rejected');
} else {
  console.log('   ❌ Invalid URL test failed');
}

// Test 5: Out of range difficulty
console.log('\n✅ Testing out of range difficulty...');
const invalidDifficultyTest = validateRaceData({ ...testRace, difficulty_score: 15 });
if (!invalidDifficultyTest.isValid && invalidDifficultyTest.error.includes('between 1 and 10')) {
  console.log('   ✓ Invalid difficulty score properly rejected');
} else {
  console.log('   ❌ Invalid difficulty score test failed');
}

console.log('\n🎉 Validation function tests completed!');