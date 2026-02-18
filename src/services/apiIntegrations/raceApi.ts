import { dbHelpers } from '../supabase';
import { logger } from '../../utils/logger';
import { rateLimiter } from './rateLimiter';

// API Configuration - Using Local Proxy Server
const API_CONFIG = {
  runsignup: {
    baseUrl: 'http://localhost:3001/api/runsignup',
    key: process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY,
    secret: process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET,
  },
};

// Race API Integrations
export class RaceAPIService {

  // Active.com API integration
  static async syncActiveComRaces() {
    if (!rateLimiter.canMakeRequest('active_com', 1000)) {
      throw new Error('Rate limit exceeded for Active.com API');
    }

    try {
      // Note: This would require actual Active.com API credentials
      // For now, we'll insert sample data to demonstrate the structure
      const sampleRaces = [
        {
          external_id: 'active_12345',
          api_source: 'active_com',
          name: 'Ironman 70.3 Miami',
          date: '2024-04-15',
          location: 'Miami, FL',
          city: 'Miami',
          state: 'FL',
          country: 'US',
          latitude: 25.7617,
          longitude: -80.1918,
          distance_type: '70.3',
          difficulty: 'intermediate',
          registration_url: 'https://www.active.com/miami-fl/triathlon/ironman-70-3-miami-2024',
          price_min: 285.00,
          price_max: 385.00,
          currency: 'USD',
          spots_available: 245,
          spots_total: 1500,
          is_sold_out: false,
          description: 'The premier 70.3 race in South Florida featuring a challenging ocean swim, scenic bike course, and exciting run through downtown Miami.',
          features: ['ocean_swim', 'flat_bike', 'urban_run']
        },
        {
          external_id: 'active_12346',
          api_source: 'active_com',
          name: 'USAT Sprint Championship',
          date: '2024-05-22',
          location: 'Austin, TX',
          city: 'Austin',
          state: 'TX',
          country: 'US',
          latitude: 30.2672,
          longitude: -97.7431,
          distance_type: 'sprint',
          difficulty: 'beginner',
          registration_url: 'https://www.active.com/austin-tx/triathlon/usat-sprint-championship-2024',
          price_min: 95.00,
          price_max: 125.00,
          currency: 'USD',
          spots_available: 89,
          spots_total: 400,
          is_sold_out: false,
          description: 'USA Triathlon sanctioned sprint distance championship race at beautiful Lake Austin.',
          features: ['lake_swim', 'rolling_bike', 'flat_run']
        }
      ];

      for (const race of sampleRaces) {
        const { error } = await dbHelpers.externalRaces.create(race);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting race:', error);
        }
      }

      return { success: true, count: sampleRaces.length };
    } catch (error) {
      logger.error('Active.com API sync failed:', error);
      throw error;
    }
  }

  // RunSignUp API integration
  static async syncRunSignUpRaces() {
    if (!rateLimiter.canMakeRequest('runsignup', 500)) {
      throw new Error('Rate limit exceeded for RunSignUp API');
    }

    try {
      // Sample RunSignUp data
      const sampleRaces = [
        {
          external_id: 'runsignup_67890',
          api_source: 'runsignup',
          name: 'Challenge Roth',
          date: '2024-07-14',
          location: 'Roth, Germany',
          city: 'Roth',
          state: 'Bavaria',
          country: 'DE',
          latitude: 49.2444,
          longitude: 11.0936,
          distance_type: 'ironman',
          difficulty: 'expert',
          registration_url: 'https://www.runsignup.com/race/challenge-roth-2024',
          price_min: 450.00,
          price_max: 450.00,
          currency: 'EUR',
          spots_available: 0,
          spots_total: 3500,
          is_sold_out: true,
          description: 'One of the most iconic Ironman-distance races in the world, known for incredible spectator support and festival atmosphere.',
          features: ['lake_swim', 'hilly_bike', 'flat_run', 'spectator_heavy']
        }
      ];

      for (const race of sampleRaces) {
        const { error } = await dbHelpers.externalRaces.create(race);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting race:', error);
        }
      }

      return { success: true, count: sampleRaces.length };
    } catch (error) {
      logger.error('RunSignUp API sync failed:', error);
      throw error;
    }
  }

  // Sync all race sources
  static async syncAllRaces() {
    const results = [];

    try {
      const activeResult = await this.syncActiveComRaces();
      results.push({ source: 'Active.com', ...activeResult });
    } catch (error) {
      results.push({ source: 'Active.com', success: false, error: error.message });
    }

    try {
      const runSignUpResult = await this.syncRunSignUpRaces();
      results.push({ source: 'RunSignUp', ...runSignUpResult });
    } catch (error) {
      results.push({ source: 'RunSignUp', success: false, error: error.message });
    }

    return results;
  }
}


// RunSignup API Integration
export class RunSignupAPIService {

  // Search for triathlon races
  static async searchTriathlonRaces(searchParams = {}) {
    if (!rateLimiter.canMakeRequest('runsignup', 1000)) {
      throw new Error('Rate limit exceeded for RunSignup API');
    }

    try {
      const params = new URLSearchParams({
        format: 'json',
        race_type: 'triathlon',
        only_partner_races: '0',
        ...searchParams
      });

      const response = await fetch(`${API_CONFIG.runsignup.baseUrl}/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RunSignup API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRunSignupRaces(data.races || []);
    } catch (error) {
      logger.error('RunSignup API error:', error);
      throw error;
    }
  }

  // Get race details by race ID
  static async getRaceDetails(raceId) {
    if (!rateLimiter.canMakeRequest('runsignup', 1000)) {
      throw new Error('Rate limit exceeded for RunSignup API');
    }

    try {
      const response = await fetch(`${API_CONFIG.runsignup.baseUrl}/race/${raceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RunSignup API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRunSignupRaceDetails(data.race);
    } catch (error) {
      logger.error('RunSignup race details error:', error);
      throw error;
    }
  }

  // Transform RunSignup race data to our course format
  static transformRunSignupRaces(races) {
    return races.map(race => ({
      external_id: race.race_id,
      source: 'runsignup',
      name: race.name,
      location: `${race.address?.city || ''}, ${race.address?.state || ''}`.trim(),
      distance_type: this.mapDistanceType(race.race_type_name),
      swim_type: 'open_water', // Default for triathlons
      description: race.description || '',
      website_url: race.url,
      race_date: race.next_date,
      registration_url: `https://runsignup.com/Race/${race.race_id}`,
      features: this.extractFeatures(race),
      created_at: new Date().toISOString()
    }));
  }

  // Transform detailed race data
  static transformRunSignupRaceDetails(race) {
    return {
      external_id: race.race_id,
      source: 'runsignup',
      name: race.name,
      location: `${race.address?.city || ''}, ${race.address?.state || ''}`.trim(),
      distance_type: this.mapDistanceType(race.race_type_name),
      swim_type: this.determineSwimType(race.description),
      description: race.description || '',
      website_url: race.url,
      race_date: race.next_date,
      registration_url: `https://runsignup.com/Race/${race.race_id}`,
      registration_opens: race.registration_opens,
      registration_closes: race.registration_closes,
      price_low: race.price_low,
      price_high: race.price_high,
      features: this.extractFeatures(race),
      latitude: race.address?.latitude,
      longitude: race.address?.longitude,
      created_at: new Date().toISOString()
    };
  }

  // Map RunSignup distance types to our format
  static mapDistanceType(raceType) {
    if (!raceType) return 'sprint';
    const type = raceType.toLowerCase();
    if (type.includes('ironman')) return 'ironman';
    if (type.includes('70.3') || type.includes('half')) return '70.3';
    if (type.includes('olympic') || type.includes('standard')) return 'olympic';
    return 'sprint';
  }

  // Determine swim type from description
  static determineSwimType(description) {
    if (!description) return null;
    const desc = description.toLowerCase();
    if (desc.includes('pool')) return 'pool';
    if (desc.includes('ocean') || desc.includes('sea')) return 'ocean';
    if (desc.includes('lake')) return 'lake';
    if (desc.includes('river')) return 'river';
    return null;
  }

  // Extract features from race data
  static extractFeatures(race) {
    const features = [];

    if (race.description) {
      const desc = race.description.toLowerCase();
      if (desc.includes('beginner')) features.push('beginner_friendly');
      if (desc.includes('challenging') || desc.includes('difficult')) features.push('challenging');
      if (desc.includes('scenic')) features.push('scenic_course');
      if (desc.includes('flat')) features.push('flat_course');
      if (desc.includes('hilly') || desc.includes('hills')) features.push('hilly_course');
    }

    if (race.price_low && race.price_low < 50) features.push('affordable');
    if (race.race_type_name?.toLowerCase().includes('sprint')) features.push('sprint_distance');

    return features;
  }

  // Sync triathlon races from RunSignup
  static async syncTriathlonRaces(maxResults = 50) {
    try {
      logger.debug('Syncing triathlon races from RunSignup...');

      // Search for triathlon races
      const races = await this.searchTriathlonRaces({
        results_per_page: maxResults,
        page: 1,
        race_type: 'triathlon',
        start_date: new Date().toISOString().split('T')[0] // From today forward
      });

      // Get existing races to check for duplicates
      const existingRaces = await dbHelpers.courses.getAll();
      const existingExternalIds = (existingRaces.data || [])
        .filter(race => race.external_id)
        .map(race => race.external_id);

      // Filter out duplicates
      const newRaces = races.filter(race => !existingExternalIds.includes(race.external_id));

      let successCount = 0;
      for (const race of newRaces) {
        try {
          const result = await dbHelpers.courses.create(race);
          if (result.data) {
            successCount++;
            logger.debug(`Added RunSignup race: ${race.name}`);
          }
        } catch (error) {
          logger.error(`Error adding race ${race.name}:`, error);
        }
      }

      return {
        success: true,
        count: successCount,
        skipped: races.length - successCount,
        total: races.length,
        source: 'RunSignup'
      };
    } catch (error) {
      logger.error('RunSignup sync error:', error);
      throw error;
    }
  }
}
