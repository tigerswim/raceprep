# User-Created Races System Documentation

This document describes the comprehensive backend system for user-created race management in RacePrep. The system allows users to create, manage, and track their own custom races alongside external races from APIs.

## Overview

The user-created races system extends the existing race management functionality by:
- Allowing users to create custom races with flexible distances
- Integrating seamlessly with existing race results, nutrition plans, and packing lists
- Providing comprehensive validation and security
- Supporting both standard triathlon distances and custom configurations

## Database Schema

### Core Table: `user_races`

```sql
CREATE TABLE user_races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  distance_type TEXT NOT NULL CHECK (distance_type IN ('sprint', 'olympic', 'half', 'ironman', 'custom')),
  swim_distance NUMERIC(10,3), -- in meters
  bike_distance NUMERIC(10,3), -- in kilometers
  run_distance NUMERIC(10,3), -- in kilometers
  difficulty_score INTEGER CHECK (difficulty_score >= 1 AND difficulty_score <= 10),
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Extended Tables

The following existing tables have been extended to support user-created races:

#### `race_results`
- Added `user_race_id UUID REFERENCES user_races(id)`
- Modified constraint to allow either `race_id` OR `user_race_id`

#### `nutrition_plans`
- Added `user_race_id UUID REFERENCES user_races(id)`
- Updated constraint to allow linking to user races

#### `packing_lists`
- Added `user_race_id UUID REFERENCES user_races(id)`
- Updated constraint to allow linking to user races

## Security & Row Level Security (RLS)

All user race data is protected by RLS policies ensuring users can only:
- View their own races (`auth.uid() = user_id`)
- Create races under their own user ID
- Update only their own races
- Delete only their own races

## API Helper Functions

### Core Operations

#### `dbHelpers.userRaces.create(raceData)`
Creates a new user race with full validation and automatic distance defaults.

```typescript
const newRace = await dbHelpers.userRaces.create({
  name: 'My Custom Sprint',
  date: '2024-12-15',
  location: 'Local Lake',
  distance_type: 'sprint', // Auto-fills standard distances
  difficulty_score: 7,
  description: 'A challenging local race'
});
```

#### `dbHelpers.userRaces.getAll()`
Retrieves all races for the authenticated user, ordered by date.

#### `dbHelpers.userRaces.getById(raceId)`
Retrieves a specific race with ownership validation.

#### `dbHelpers.userRaces.update(raceId, updates)`
Updates a race with validation and ownership checks.

#### `dbHelpers.userRaces.delete(raceId)`
Deletes a race with ownership validation.

### Advanced Features

#### `dbHelpers.userRaces.getUpcoming(limit)`
Gets upcoming races with countdown calculations and preparation status.

```typescript
const upcoming = await dbHelpers.userRaces.getUpcoming(5);
// Returns races with: daysUntil, weeksUntil, preparationStatus
```

#### `dbHelpers.userRaces.getCombinedUpcomingRaces(limit)`
Combines user-created races with planned external races for unified dashboard display.

#### `dbHelpers.userRaces.getWithRelatedData(raceId)`
Retrieves a race with all associated data (results, nutrition plans, packing lists).

#### `dbHelpers.userRaces.getStatistics()`
Provides comprehensive race statistics for dashboard widgets.

```typescript
const stats = await dbHelpers.userRaces.getStatistics();
// Returns: total, upcoming, past, byDistance, avgDifficulty, nextRace
```

#### `dbHelpers.userRaces.search(query)`
Searches races by name or location.

#### `dbHelpers.userRaces.exportData(format)`
Exports user races in JSON or CSV format.

## Validation System

### Required Fields
- `name`: 1-200 characters
- `date`: Valid date, not more than 5 years past or 10 years future
- `location`: 1-200 characters
- `distance_type`: One of 'sprint', 'olympic', 'half', 'ironman', 'custom'

### Optional Field Validation
- `swim_distance`: 0-10,000 meters
- `bike_distance`: 0-300 kilometers
- `run_distance`: 0-50 kilometers
- `difficulty_score`: Integer 1-10
- `description`: Max 1,000 characters
- `website_url`: Valid HTTP/HTTPS URL

### Automatic Defaults

When creating races with standard distance types, default distances are automatically applied:

```typescript
const defaults = {
  sprint: { swim_distance: 750, bike_distance: 20, run_distance: 5 },
  olympic: { swim_distance: 1500, bike_distance: 40, run_distance: 10 },
  half: { swim_distance: 1900, bike_distance: 90, run_distance: 21.1 },
  ironman: { swim_distance: 3800, bike_distance: 180, run_distance: 42.2 }
};
```

## Integration with Existing Systems

### Race Results
Race results can now link to user-created races:

```typescript
const result = await dbHelpers.raceResults.add({
  user_race_id: 'user-race-uuid', // Instead of race_id
  overall_time: '01:30:00',
  swim_time: '00:20:00',
  // ... other fields
});
```

### Dashboard Integration
The `dbHelpers.races.getUpcoming()` method now automatically includes user-created races, providing seamless integration with existing dashboard widgets.

### Unified Race Queries
All race result queries now include both external and user-created race data through JOIN statements.

## Preparation Status Algorithm

The system calculates preparation status based on ideal training weeks:

```typescript
const idealWeeks = {
  sprint: 8, olympic: 12, half: 20, ironman: 30, custom: 12
};

// Status: 'excellent', 'good', 'moderate', 'critical'
```

## Migration Instructions

1. **Apply the migration:**
   ```sql
   -- Run the contents of supabase/migrations/007_add_user_races.sql
   ```

2. **Verify the setup:**
   ```bash
   node test_validation_only.js
   ```

3. **Test in your app:**
   ```typescript
   // Test basic functionality
   const races = await dbHelpers.userRaces.getAll();
   console.log('User races:', races);
   ```

## Usage Examples

### Creating a Custom Race
```typescript
const customRace = await dbHelpers.userRaces.create({
  name: 'Mountain Challenge Triathlon',
  date: '2025-06-15',
  location: 'Alpine Lake Resort',
  distance_type: 'custom',
  swim_distance: 1200, // Custom distances
  bike_distance: 50,
  run_distance: 12,
  difficulty_score: 9,
  description: 'A challenging mountain triathlon with significant elevation',
  website_url: 'https://mountainchallenge.com'
});
```

### Getting Dashboard Data
```typescript
const upcomingRaces = await dbHelpers.userRaces.getCombinedUpcomingRaces(5);
const stats = await dbHelpers.userRaces.getStatistics();

// Combined data includes both user-created and planned external races
console.log('Next race in', upcomingRaces.data[0]?.daysUntil, 'days');
```

### Linking Race Results
```typescript
// After completing a user-created race
const result = await dbHelpers.raceResults.add({
  user_race_id: customRace.data.id,
  overall_time: '02:15:30',
  swim_time: '00:25:00',
  t1_time: '00:02:30',
  bike_time: '01:20:00',
  t2_time: '00:01:30',
  run_time: '00:26:30',
  overall_placement: 15,
  age_group_placement: 3
});
```

## Error Handling

All functions return consistent error objects:

```typescript
const { data, error } = await dbHelpers.userRaces.create(invalidData);
if (error) {
  console.error('Validation failed:', error);
  // Handle specific validation errors
}
```

## Performance Considerations

- All queries include proper indexes for optimal performance
- RLS policies are optimized for user_id filtering
- Combined queries use efficient JOINs
- Caching is integrated for dashboard data

## Future Enhancements

Potential areas for expansion:
- Race series/challenges support
- Social sharing of user races
- Race templates for common custom formats
- Integration with GPS/mapping services
- Race photo/media attachments
- Collaborative race planning

## Testing

Run the validation tests to ensure proper setup:

```bash
node test_validation_only.js
```

The system includes comprehensive validation testing for:
- Required field validation
- Data type validation
- Boundary condition testing
- URL format validation
- Date range validation

## Support

For issues or questions about the user-created races system:
1. Check the validation error messages for specific field issues
2. Verify RLS policies if permission errors occur
3. Ensure migration has been applied if table errors occur
4. Check authentication state for "Not authenticated" errors

The system is designed to be robust, secure, and user-friendly while maintaining full compatibility with the existing RacePrep architecture.