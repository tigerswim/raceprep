import { logger } from '../utils/logger';
// Sample data for development and testing

export const sampleRaces = [
  {
    id: '1',
    name: 'Atlanta Sprint Triathlon',
    location: 'Atlanta, GA',
    event_date: '2024-06-15',
    distance_type: 'sprint',
    description: 'A beautiful course around Lake Lanier with great transition areas and post-race festivities.',
    swim_distance: 750, // meters
    bike_distance: 20, // kilometers  
    run_distance: 5, // kilometers
    water_type: 'open_water',
    elevation_gain: 150, // feet
    difficulty_score: 6
  },
  {
    id: '2', 
    name: 'Chattanooga Olympic',
    location: 'Chattanooga, TN',
    event_date: '2024-09-22',
    distance_type: 'olympic',
    description: 'Challenging bike course with rolling hills and scenic river views.',
    swim_distance: 1500, // meters
    bike_distance: 40, // kilometers
    run_distance: 10, // kilometers  
    water_type: 'open_water',
    elevation_gain: 850, // feet
    difficulty_score: 8
  },
  {
    id: '3',
    name: 'Georgia State Games Triathlon',
    location: 'Columbus, GA', 
    event_date: '2024-05-18',
    distance_type: 'sprint',
    description: 'Fast flat course perfect for PRs. Well-organized event with excellent volunteers.',
    swim_distance: 750, // meters
    bike_distance: 20, // kilometers
    run_distance: 5, // kilometers
    water_type: 'open_water',
    elevation_gain: 75, // feet
    difficulty_score: 4
  }
];

export const sampleRaceResults = [
  {
    id: '1',
    race_id: '1', // Atlanta Sprint Triathlon
    user_id: 'sample-user-id',
    result_date: '2024-06-15',
    swim_time: 600, // 10:00
    t1_time: 120, // 2:00
    bike_time: 2520, // 42:00
    t2_time: 90, // 1:30
    run_time: 1380, // 23:00
    total_time: 4710, // 1:18:30
    overall_place: 42,
    age_group_place: 8,
    swim_pace: '1:20',
    avg_speed: '28.5',
    run_pace: '7:25',
    notes: 'Great race! Felt strong on the bike and held a good pace on the run. T1 could be faster - need to practice wetsuit removal.'
  },
  {
    id: '2',
    race_id: '3', // Georgia State Games  
    user_id: 'sample-user-id',
    result_date: '2024-05-18',
    swim_time: 570, // 9:30
    t1_time: 105, // 1:45  
    bike_time: 2400, // 40:00
    t2_time: 75, // 1:15
    run_time: 1320, // 22:00
    total_time: 4470, // 1:14:30
    overall_place: 28,
    age_group_place: 5,
    swim_pace: '1:16',
    avg_speed: '30.0',
    run_pace: '7:04',
    notes: 'PR! Perfect conditions and felt great throughout. Much better transitions this time. The flat course really helped with bike speed.'
  },
  {
    id: '3',
    race_id: '2', // Chattanooga Olympic
    user_id: 'sample-user-id', 
    result_date: '2024-09-22',
    swim_time: 1680, // 28:00
    t1_time: 150, // 2:30
    bike_time: 4200, // 1:10:00
    t2_time: 120, // 2:00
    run_time: 2640, // 44:00
    total_time: 8790, // 2:26:30
    overall_place: 156,
    age_group_place: 24,
    swim_pace: '1:52',
    avg_speed: '22.8',
    run_pace: '7:04',
    notes: 'Tough race! The hills on the bike course were brutal. Swim felt good despite the choppy water. Need to work on climbing strength for future hilly courses.'
  }
];

// Function to insert sample data (for development)
export const insertSampleData = async (supabase: any) => {
  try {
    // Insert races
    const { data: raceData, error: raceError } = await supabase
      .from('races')
      .insert(sampleRaces)
      .select();
    
    if (raceError) {
      logger.error('Error inserting sample races:', raceError);
      return { success: false, error: raceError };
    }

    // Insert race results
    const { data: resultData, error: resultError } = await supabase
      .from('race_results')
      .insert(sampleRaceResults)
      .select();
      
    if (resultError) {
      logger.error('Error inserting sample race results:', resultError);
      return { success: false, error: resultError };
    }

    return { success: true, races: raceData, results: resultData };
  } catch (error) {
    logger.error('Error inserting sample data:', error);
    return { success: false, error };
  }
};