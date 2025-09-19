# Strava API Integration Documentation

## Overview

The RacePrep Strava API integration provides enhanced error handling, rate limiting, retry logic, and comprehensive analytics endpoints for triathlon training data.

## Rate Limiting

All Strava endpoints implement intelligent rate limiting to respect Strava's API limits:

- **OAuth operations**: 100 requests per hour
- **Activity fetching**: 90 requests per 15 minutes
- **Analytics**: 50 requests per hour
- **Sync operations**: 20 requests per hour

Rate limit headers are included in responses to help clients manage their usage.

## Error Handling

All endpoints provide detailed error responses with:
- Specific error codes and messages
- Retry suggestions
- Rate limit information
- Recovery instructions

## Authentication Endpoints

### POST `/api/strava/connect`

Exchange authorization code for access tokens.

**Request Body:**
```json
{
  "code": "authorization_code_from_strava"
}
```

**Success Response (200):**
```json
{
  "access_token": "strava_access_token",
  "refresh_token": "strava_refresh_token",
  "expires_at": 1234567890,
  "athlete": {
    "id": 12345,
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

**Error Responses:**
- `400`: Invalid authorization code
- `429`: Rate limit exceeded
- `500`: Server error

### POST `/api/strava/refresh`

Refresh expired access tokens.

**Request Body:**
```json
{
  "refresh_token": "strava_refresh_token"
}
```

**Success Response (200):**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "expires_at": 1234567890
}
```

**Error Responses:**
- `401`: Invalid refresh token (requires re-authentication)
- `429`: Rate limit exceeded
- `500`: Server error

## Activity Endpoints

### GET `/api/strava/activities`

Fetch and transform Strava activities for triathlon training.

**Query Parameters:**
- `access_token` (required): Valid Strava access token
- `after` (optional): Unix timestamp for start date
- `before` (optional): Unix timestamp for end date
- `per_page` (optional): Number of activities (1-200, default: 30)

**Success Response (200):**
```json
{
  "activities": [
    {
      "id": 1234567890,
      "type": "swim|bike|run",
      "date": "2024-01-15",
      "distance": 5000,
      "moving_time": 1800,
      "name": "Morning Training",
      "average_speed": 2.78,
      "total_elevation_gain": 100,
      "average_heartrate": 150,
      "max_heartrate": 175,
      "average_watts": 250,
      "trainer": false,
      "sport_type": "Run",
      "suffer_score": 45,
      "elapsed_time": 1900,
      "average_cadence": 85,
      "start_latlng": [40.7128, -74.0060],
      "kudos_count": 5
    }
  ],
  "total_fetched": 50,
  "total_valid": 45,
  "validation_errors": [
    {
      "id": 9876543210,
      "errors": ["Missing activity type"]
    }
  ],
  "rate_limit_remaining": 85
}
```

**Error Responses:**
- `400`: Missing access token
- `401`: Invalid or expired token
- `403`: Insufficient permissions
- `429`: Rate limit exceeded

## Analytics Endpoints

### GET `/api/strava/analytics/weekly`

Get weekly training statistics and trends.

**Query Parameters:**
- `access_token` (required): Valid Strava access token
- `weeks` (optional): Number of weeks to analyze (1-12, default: 4)

**Success Response (200):**
```json
{
  "weeks": [
    {
      "week_start": "2024-01-08",
      "week_end": "2024-01-14",
      "swim": {
        "distance": 5000,
        "time": 3600,
        "sessions": 3
      },
      "bike": {
        "distance": 150000,
        "time": 18000,
        "sessions": 4,
        "elevation": 1500
      },
      "run": {
        "distance": 50000,
        "time": 12000,
        "sessions": 5,
        "elevation": 500
      },
      "total": {
        "distance": 205000,
        "time": 33600,
        "sessions": 12
      }
    }
  ],
  "period": {
    "start": "2023-12-18",
    "end": "2024-01-15",
    "weeks": 4
  }
}
```

### GET `/api/strava/analytics/monthly`

Get monthly training statistics and trends.

**Query Parameters:**
- `access_token` (required): Valid Strava access token
- `months` (optional): Number of months to analyze (1-12, default: 6)

**Success Response (200):**
```json
{
  "months": [
    {
      "month": "2024-01",
      "month_name": "January 2024",
      "swim": {
        "distance": 20000,
        "time": 14400,
        "sessions": 12
      },
      "bike": {
        "distance": 600000,
        "time": 72000,
        "sessions": 16,
        "elevation": 6000
      },
      "run": {
        "distance": 200000,
        "time": 48000,
        "sessions": 20,
        "elevation": 2000
      },
      "total": {
        "distance": 820000,
        "time": 134400,
        "sessions": 48
      }
    }
  ],
  "period": {
    "start": "2023-08-01",
    "end": "2024-01-31",
    "months": 6
  }
}
```

## Sync Progress Tracking

### POST `/api/strava/sync/progress`

Start a background sync operation with progress tracking.

**Request Body:**
```json
{
  "access_token": "strava_access_token",
  "sync_id": "unique_sync_identifier"
}
```

**Success Response (200):**
```json
{
  "message": "Sync started",
  "progress": {
    "sync_id": "unique_sync_identifier",
    "status": "in_progress",
    "started_at": "2024-01-15T10:30:00Z",
    "total_activities": 0,
    "processed_activities": 0,
    "successful_activities": 0,
    "failed_activities": 0,
    "errors": [],
    "current_step": "fetching_activities"
  },
  "tracking_endpoint": "/api/strava/sync/status/unique_sync_identifier"
}
```

### GET `/api/strava/sync/status/:syncId`

Get the current status of a sync operation.

**Success Response (200):**
```json
{
  "sync_id": "unique_sync_identifier",
  "status": "completed|in_progress|failed",
  "started_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:35:00Z",
  "total_activities": 45,
  "processed_activities": 45,
  "successful_activities": 42,
  "failed_activities": 3,
  "errors": [
    {
      "id": "123",
      "errors": ["Invalid distance value"]
    }
  ],
  "current_step": "finished"
}
```

## Data Transformation

The API automatically transforms Strava activity types to internal triathlon training types:

| Strava Type | Internal Type | Notes |
|-------------|---------------|-------|
| Swim | swim | Pool and open water swimming |
| Ride | bike | Road cycling |
| VirtualRide | bike | Indoor trainer sessions |
| EBikeRide | bike | Electric bike activities |
| MountainBikeRide | bike | Off-road cycling |
| Run | run | Road running |
| VirtualRun | run | Treadmill sessions |
| TrailRun | run | Off-road running |
| Other types | null | Filtered out (not triathlon-related) |

## Usage Examples

### Basic Activity Sync
```javascript
// Fetch recent activities
const response = await fetch('/api/strava/activities?access_token=TOKEN&per_page=50');
const data = await response.json();

if (response.ok) {
  console.log(`Fetched ${data.activities.length} valid activities`);
  // Process activities...
} else {
  console.error('Sync failed:', data.error);
}
```

### Weekly Analytics
```javascript
// Get 8 weeks of training data
const response = await fetch('/api/strava/analytics/weekly?access_token=TOKEN&weeks=8');
const analytics = await response.json();

analytics.weeks.forEach(week => {
  console.log(`Week ${week.week_start}: ${week.total.sessions} sessions, ${week.total.distance}m total`);
});
```

### Progress Tracking
```javascript
// Start sync with progress tracking
const syncId = `sync_${Date.now()}`;
const startResponse = await fetch('/api/strava/sync/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_token: 'TOKEN',
    sync_id: syncId
  })
});

// Poll for progress
const pollProgress = async () => {
  const response = await fetch(`/api/strava/sync/status/${syncId}`);
  const progress = await response.json();

  console.log(`Progress: ${progress.processed_activities}/${progress.total_activities}`);

  if (progress.status === 'in_progress') {
    setTimeout(pollProgress, 2000); // Poll every 2 seconds
  } else {
    console.log('Sync completed:', progress);
  }
};

pollProgress();
```

## Rate Limit Management

Monitor rate limits and handle 429 responses appropriately:

```javascript
async function fetchWithRateLimit(url, options) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const data = await response.json();
    const retryAfter = data.retry_after || 3600;

    console.log(`Rate limited, waiting ${retryAfter} seconds`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

    // Retry the request
    return fetchWithRateLimit(url, options);
  }

  return response;
}
```

## Error Recovery

Handle token expiration and refresh automatically:

```javascript
async function apiCall(endpoint, accessToken, refreshToken) {
  let response = await fetch(endpoint + '?access_token=' + accessToken);

  if (response.status === 401) {
    // Token expired, refresh it
    const refreshResponse = await fetch('/api/strava/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (refreshResponse.ok) {
      const tokens = await refreshResponse.json();
      // Retry with new token
      response = await fetch(endpoint + '?access_token=' + tokens.access_token);
    }
  }

  return response;
}
```

## Health Check

The enhanced health check endpoint provides system status and rate limit information:

```javascript
const healthCheck = await fetch('/health');
const health = await healthCheck.json();

console.log('API Status:', health.status);
console.log('Rate Limits:', health.rate_limits);
console.log('Features:', health.features);
```

This provides visibility into system health and available capacity for API calls.