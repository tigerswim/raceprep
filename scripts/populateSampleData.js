// Script to populate sample data for testing
import { createClient } from '@supabase/supabase-js';
import { sampleRaces } from '../src/data/sampleData.ts';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateData() {
  try {
    console.log('Populating sample races...');
    
    // Clear existing data first
    await supabase.from('race_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('races').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert sample races
    const { data: raceData, error: raceError } = await supabase
      .from('races')
      .insert(sampleRaces)
      .select();
    
    if (raceError) {
      console.error('Error inserting sample races:', raceError);
      return;
    }
    
    console.log('Sample races inserted:', raceData.length);
    
    // Note: We're not inserting race results here as they'll be added through the UI
    console.log('Sample data population complete!');
    
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}

populateData();