// Utility to insert sample races into the database
import { logger } from './logger';
import { supabase } from '../services/supabase';

export const insertSampleRaces = async () => {
  const sampleRaces = [
    {
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

  try {
    const { data, error } = await supabase
      .from('races')
      .insert(sampleRaces)
      .select();
    
    if (error) {
      logger.error('Error inserting sample races:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Error inserting sample races:', error);
    return { success: false, error };
  }
};

// Quick test function to call from console
if (typeof window !== 'undefined') {
  (window as any).insertSampleRaces = insertSampleRaces;
}