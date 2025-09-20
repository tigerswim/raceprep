// Strava API Fields Explorer
// This script shows all available fields from Strava Activities API

console.log('=== STRAVA ACTIVITY FIELDS REFERENCE ===\n');

// Based on Strava API documentation and your debug logs
const stravaActivityFields = {
  // === Basic Identifiers ===
  id: 'Unique activity ID (number)',
  external_id: 'External activity ID from GPS device (string)',
  upload_id: 'Upload ID (number)',

  // === Basic Info ===
  name: 'Activity name/title (string)',
  type: 'Activity type (string) - Run, Ride, Swim, etc.',
  sport_type: 'More specific sport type (string) - VirtualRun, TrailRun, etc.',

  // === Timing ===
  start_date: 'Start time in UTC (ISO 8601 string)',
  start_date_local: 'Start time in local timezone (ISO 8601 string)',
  timezone: 'Timezone (string)',

  // === Duration & Distance ===
  distance: 'Distance in meters (float)',
  moving_time: 'Moving time in seconds (integer)',
  elapsed_time: 'Total elapsed time in seconds (integer)',

  // === Performance Metrics ===
  average_speed: 'Average speed in m/s (float)',
  max_speed: 'Max speed in m/s (float)',
  average_cadence: 'Average cadence (float)',
  average_watts: 'Average power in watts (float)',
  weighted_average_watts: 'Weighted average power (float)',
  kilojoules: 'Energy in kilojoules (float)',

  // === Heart Rate ===
  average_heartrate: 'Average heart rate (float)',
  max_heartrate: 'Max heart rate (integer)',

  // === Elevation ===
  total_elevation_gain: 'Total elevation gain in meters (float)',
  elev_high: 'Highest elevation in meters (float)',
  elev_low: 'Lowest elevation in meters (float)',

  // === Location ===
  start_latlng: 'Start coordinates [lat, lng] (array)',
  end_latlng: 'End coordinates [lat, lng] (array)',
  map: 'Map object with polyline data (object)',

  // === Training ===
  trainer: 'Was on indoor trainer (boolean)',
  commute: 'Was a commute (boolean)',
  manual: 'Was manually entered (boolean)',
  private: 'Is private activity (boolean)',
  flagged: 'Was flagged by Strava (boolean)',

  // === Social ===
  achievement_count: 'Number of achievements (integer)',
  kudos_count: 'Number of kudos (integer)',
  comment_count: 'Number of comments (integer)',
  athlete_count: 'Number of athletes (integer)',

  // === Calculated ===
  suffer_score: 'Strava suffer score (integer)',
  has_kudoed: 'Current user has kudoed (boolean)',

  // === Gear ===
  gear_id: 'ID of gear used (string)',

  // === Segments ===
  segment_efforts: 'Array of segment efforts (array)',

  // === Detailed Streams (if requested) ===
  // These require separate API calls to /activities/{id}/streams
  // time: 'Time series data',
  // latlng: 'GPS coordinate series',
  // altitude: 'Elevation series',
  // velocity_smooth: 'Smoothed velocity series',
  // heartrate: 'Heart rate series',
  // cadence: 'Cadence series',
  // watts: 'Power series',
  // temp: 'Temperature series'
};

console.log('BASIC FIELDS (from /athlete/activities):');
Object.entries(stravaActivityFields).forEach(([field, description]) => {
  console.log(`  ${field.padEnd(25)} - ${description}`);
});

console.log('\n=== FIELDS CURRENTLY USED IN RACEPREP ===');
const currentFields = [
  'id - Activity identifier',
  'name - Activity title',
  'type - Activity type (converted to swim/bike/run)',
  'start_date - Activity date',
  'distance - Distance in meters',
  'moving_time - Duration in seconds'
];

currentFields.forEach(field => {
  console.log(`  ✓ ${field}`);
});

console.log('\n=== POTENTIALLY USEFUL UNUSED FIELDS ===');
const potentialFields = [
  'average_speed - Could calculate pace/speed',
  'total_elevation_gain - Useful for training difficulty',
  'average_heartrate - Training intensity',
  'average_watts - Power data for cycling',
  'trainer - Distinguish indoor vs outdoor',
  'start_latlng - Location data for mapping',
  'suffer_score - Strava training stress',
  'average_cadence - Running/cycling cadence',
  'sport_type - More specific activity types (VirtualRun, TrailRun, etc.)'
];

potentialFields.forEach(field => {
  console.log(`  💡 ${field}`);
});

console.log('\n=== SAMPLE ACTIVITY OBJECT STRUCTURE ===');
const sampleActivity = {
  id: 123456789,
  name: "Morning Run",
  type: "Run",
  sport_type: "Run",
  start_date: "2024-01-15T14:30:00Z",
  start_date_local: "2024-01-15T09:30:00-05:00",
  timezone: "(GMT-05:00) America/New_York",
  distance: 8000.0,
  moving_time: 2400,
  elapsed_time: 2580,
  total_elevation_gain: 120.0,
  average_speed: 3.33,
  max_speed: 4.5,
  average_heartrate: 145.5,
  max_heartrate: 165,
  suffer_score: 82,
  trainer: false,
  commute: false,
  start_latlng: [40.7128, -74.0060],
  kudos_count: 3,
  achievement_count: 1
};

console.log(JSON.stringify(sampleActivity, null, 2));

console.log('\n=== TO GET MORE DETAILED DATA ===');
console.log('For detailed streams (GPS, heart rate series, etc.):');
console.log('  GET /activities/{id}/streams/{types}');
console.log('  Types: time,latlng,distance,altitude,velocity_smooth,heartrate,cadence,watts,temp');