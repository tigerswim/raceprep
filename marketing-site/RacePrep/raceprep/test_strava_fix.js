// Test script to verify Strava activity type mapping
const mockStravaActivities = [
  { id: 1, type: 'Swim', name: 'Morning Swim', distance: 2000, moving_time: 3600, start_date: '2024-01-15T08:00:00Z' },
  { id: 2, type: 'Ride', name: 'Afternoon Bike', distance: 40000, moving_time: 7200, start_date: '2024-01-15T14:00:00Z' },
  { id: 3, type: 'VirtualRide', name: 'Zwift Session', distance: 30000, moving_time: 3600, start_date: '2024-01-15T18:00:00Z' },
  { id: 4, type: 'Run', name: 'Easy Run', distance: 8000, moving_time: 2400, start_date: '2024-01-15T07:00:00Z' },
  { id: 5, type: 'VirtualRun', name: 'Treadmill Run', distance: 10000, moving_time: 3000, start_date: '2024-01-15T19:00:00Z' },
  { id: 6, type: 'WeightTraining', name: 'Gym Session', distance: 0, moving_time: 3600, start_date: '2024-01-15T17:00:00Z' },
  { id: 7, type: 'EBikeRide', name: 'E-bike Commute', distance: 15000, moving_time: 1800, start_date: '2024-01-15T09:00:00Z' }
];

// Test the server-side mapping logic
function testServerMapping(activities) {
  console.log('=== Testing Server-Side Activity Mapping ===\n');

  const filteredActivities = activities
    .map(activity => {
      // Map Strava activity types to our database schema (swim/bike/run only)
      const stravaType = activity.type.toLowerCase();
      let mappedType;

      if (stravaType === 'swim') {
        mappedType = 'swim';
      } else if (stravaType === 'ride' || stravaType === 'virtualride' || stravaType === 'ebikeride' || stravaType === 'mountainbikeride') {
        mappedType = 'bike';
      } else if (stravaType === 'run' || stravaType === 'virtualrun') {
        mappedType = 'run';
      } else {
        // Skip unsupported activity types
        console.log(`❌ SKIPPED: ${activity.type} - "${activity.name}" (unsupported type)`);
        return null;
      }

      console.log(`✅ MAPPED: ${activity.type} → ${mappedType} - "${activity.name}"`);
      return {
        id: activity.id,
        type: mappedType,
        name: activity.name,
        date: activity.start_date.split('T')[0],
        distance: activity.distance,
        moving_time: activity.moving_time
      };
    })
    .filter(activity => activity !== null);

  console.log(`\n=== RESULTS ===`);
  console.log(`Total activities processed: ${activities.length}`);
  console.log(`Activities mapped and kept: ${filteredActivities.length}`);

  const typeCounts = filteredActivities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {});

  console.log(`Type distribution:`, typeCounts);

  return filteredActivities;
}

// Run the test
testServerMapping(mockStravaActivities);