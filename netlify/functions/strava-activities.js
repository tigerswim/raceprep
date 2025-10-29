exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { access_token, after, before, per_page = '30' } = event.queryStringParameters || {};

    if (!access_token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Access token is required' })
      };
    }

    console.log('Fetching activities with token:', access_token.substring(0, 10) + '...');

    const params = new URLSearchParams({
      per_page: per_page.toString()
    });

    if (after) params.append('after', after);
    if (before) params.append('before', before);

    const url = `https://www.strava.com/api/v3/athlete/activities?${params}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Strava API error: ${response.status}`,
          details: await response.text()
        })
      };
    }

    const activities = await response.json();

    // Filter and format activities for triathlon training
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
          return null;
        }

        return {
          id: activity.id,
          type: mappedType,
          date: activity.start_date.split('T')[0],
          distance: activity.distance, // meters
          moving_time: activity.moving_time, // seconds
          name: activity.name,
          // Enhanced fields
          average_speed: activity.average_speed, // m/s
          total_elevation_gain: activity.total_elevation_gain, // meters
          average_heartrate: activity.average_heartrate, // bpm
          max_heartrate: activity.max_heartrate, // bpm
          average_watts: activity.average_watts, // watts (cycling)
          trainer: activity.trainer || false, // indoor trainer
          sport_type: activity.sport_type, // VirtualRun, TrailRun, etc.
          suffer_score: activity.suffer_score, // Strava training stress
          elapsed_time: activity.elapsed_time, // total elapsed time
          average_cadence: activity.average_cadence, // steps/min or rpm
          start_latlng: activity.start_latlng, // [lat, lng] coordinates
          kudos_count: activity.kudos_count || 0 // social engagement
        };
      })
      .filter(activity => activity !== null); // Remove null entries

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(filteredActivities)
    };

  } catch (error) {
    console.error('Strava activities error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get Strava activities',
        details: error.message
      })
    };
  }
};