exports.handler = async (event, context) => {
  console.log('[NETLIFY FUNCTION] runsignup-search invoked');
  console.log('[NETLIFY FUNCTION] Event:', JSON.stringify(event, null, 2));
  console.log('[NETLIFY FUNCTION] Environment check:', {
    hasApiKey: !!process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY,
    hasApiSecret: !!process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET
  });

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('[NETLIFY FUNCTION] Handling OPTIONS request');
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    console.log('[NETLIFY FUNCTION] Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check environment variables
    if (!process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY || !process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET) {
      console.error('[NETLIFY FUNCTION] Missing required environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Missing API credentials',
          details: 'EXPO_PUBLIC_RUNSIGNUP_API_KEY or EXPO_PUBLIC_RUNSIGNUP_API_SECRET not configured'
        })
      };
    }

    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    console.log('[NETLIFY FUNCTION] Query parameters:', queryParams);

    const searchParams = new URLSearchParams({
      format: 'json',
      api_key: process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY,
      api_secret: process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET,
      only_partner_races: '0'
    });

    // Check if this is a nationwide search (radius = 'all' means nationwide)
    const isNationwide = queryParams.radius === 'all';

    // Add all query parameters except handle location and radius logic
    Object.keys(queryParams).forEach(key => {
      if (key === 'radius' && isNationwide) {
        // Skip adding radius parameter for nationwide searches
        return;
      }
      searchParams.append(key, queryParams[key]);
    });

    // Only use default location if no location parameters are provided AND not a nationwide search
    if (!isNationwide && !queryParams.zipcode && !queryParams.search && !queryParams.lat && !queryParams.lon) {
      searchParams.set('zipcode', '30309'); // Default to Atlanta, GA
      searchParams.set('radius', '100'); // Default radius for local searches
    }

    // If searching for triathlons, use proper event_type parameter
    if (queryParams.event_type === 'triathlon') {
      searchParams.set('event_type', 'triathlon');
      // Don't delete search or location parameters - they're needed for geographic filtering
    }

    const url = `https://runsignup.com/Rest/races?${searchParams}`;
    console.log('[RUNSIGNUP API] Request URL:', url);
    console.log('[RUNSIGNUP API] Parameters:', Object.fromEntries(searchParams));

    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `RunSignup API error: ${response.status}`,
          details: await response.text()
        })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('RunSignup search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to search RunSignup races',
        details: error.message
      })
    };
  }
};