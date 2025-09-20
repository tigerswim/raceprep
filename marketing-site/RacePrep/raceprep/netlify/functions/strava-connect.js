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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { code } = JSON.parse(event.body);

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' })
      };
    }

    const tokenParams = new URLSearchParams({
      client_id: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code'
    });

    console.log('Strava OAuth request:', {
      clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID,
      code: code ? `${code.substring(0, 10)}...` : 'null'
    });

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams
    });

    console.log(`Strava OAuth response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strava OAuth failed (${response.status}): ${errorText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Strava OAuth failed: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    console.log('Strava OAuth success! Token received:', {
      has_access_token: !!data.access_token,
      has_refresh_token: !!data.refresh_token,
      expires_at: data.expires_at,
      athlete_id: data.athlete?.id
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Strava OAuth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to connect to Strava',
        details: error.message
      })
    };
  }
};