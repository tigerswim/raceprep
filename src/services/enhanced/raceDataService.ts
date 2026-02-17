// Enhanced Race Data Service with Countdown Calculations and Preparation Status
// Provides optimized queries for race data with advanced analytics

import { dbHelpers, supabase } from '../supabase';
import { withRetry, withTimeout, TimeoutHandler, RequestTracker } from '../shared/errorHandling';
import { logger } from '../../utils/logger';

export interface RaceWithCountdown {
  id: string;
  name: string;
  date: string;
  location: string;
  city: string;
  state: string;
  country: string;
  distance_type: string;
  difficulty?: string;
  daysUntil: number;
  weeksUntil: number;
  monthsUntil: number;
  isPriority: boolean;
  preparationStatus: 'excellent' | 'good' | 'moderate' | 'critical' | 'too_late';
  preparationWeeksRemaining: number;
  idealPrepWeeks: number;
  registrationStatus: 'open' | 'closing_soon' | 'closed' | 'unknown';
  weatherForecast?: any;
  userPlanedRace?: any;
}

export interface RacePreparationAnalysis {
  raceId: string;
  raceName: string;
  raceDate: string;
  distanceType: string;
  daysUntil: number;
  preparationStatus: string;
  recommendations: string[];
  trainingPlan: {
    weeksRemaining: number;
    currentPhase: 'base' | 'build' | 'peak' | 'taper' | 'recovery';
    weeklyHours: number;
    focusAreas: string[];
  };
  nutritionPlanning: {
    raceStrategy: string;
    practiceRaces: string[];
    supplementTesting: boolean;
  };
  gearPreparation: {
    essentialItems: string[];
    optionalItems: string[];
    testingNeeded: string[];
  };
}

export interface RaceSearchFilters {
  distanceTypes?: string[];
  startDate?: string;
  endDate?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number;
    latitude?: number;
    longitude?: number;
  };
  difficulty?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  features?: string[];
  registrationStatus?: string[];
  userRegistered?: boolean;
}

export class EnhancedRaceDataService {
  // Cache for race data to avoid repeated queries
  private static raceCache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  // Enhanced race distance configurations
  private static readonly RACE_CONFIGS = {
    'sprint': {
      idealPrepWeeks: 8,
      minPrepWeeks: 4,
      focusAreas: ['technique', 'speed', 'transitions'],
      weeklyHours: { base: 6, build: 8, peak: 10, taper: 4 }
    },
    'olympic': {
      idealPrepWeeks: 12,
      minPrepWeeks: 6,
      focusAreas: ['endurance', 'technique', 'race_pace'],
      weeklyHours: { base: 8, build: 12, peak: 15, taper: 6 }
    },
    '70.3': {
      idealPrepWeeks: 20,
      minPrepWeeks: 12,
      focusAreas: ['aerobic_base', 'endurance', 'nutrition'],
      weeklyHours: { base: 12, build: 18, peak: 22, taper: 8 }
    },
    'ironman': {
      idealPrepWeeks: 30,
      minPrepWeeks: 20,
      focusAreas: ['aerobic_base', 'mental_training', 'nutrition', 'pacing'],
      weeklyHours: { base: 15, build: 25, peak: 30, taper: 10 }
    }
  };

  // Get upcoming races with enhanced countdown and preparation analysis
  static async getUpcomingRacesWithCountdown(limit: number = 5): Promise<RaceWithCountdown[]> {
    const trackingId = RequestTracker.start('enhanced_upcoming_races', undefined, { limit });

    try {
      const result = await withTimeout(
        withRetry(async () => {
          // Get user's planned races with external race data
          const { data: plannedRaces, error } = await supabase
            .from('user_planned_races')
            .select(`
              *,
              external_races (
                id,
                name,
                date,
                city,
                state,
                country,
                distance_type,
                location,
                latitude,
                longitude,
                registration_url,
                price_min,
                price_max,
                features,
                difficulty
              )
            `)
            .gte('external_races.date', new Date().toISOString().split('T')[0])
            .in('status', ['registered', 'training', 'interested'])
            .order('external_races.date', { ascending: true })
            .limit(limit);

          if (error) throw error;
          return plannedRaces || [];
        }, {}, 'upcoming_races_query'),
        TimeoutHandler.getTimeout('database'),
        'upcoming_races_query'
      );

      // Transform and enhance with countdown calculations
      const enhancedRaces = result.map(plannedRace =>
        this.enhanceRaceWithCountdown(plannedRace.external_races, plannedRace)
      ).filter(race => race !== null);

      // Sort by preparation urgency and date
      enhancedRaces.sort((a, b) => {
        // Priority races first
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;

        // Then by preparation status urgency
        const statusPriority = { 'critical': 4, 'moderate': 3, 'good': 2, 'excellent': 1, 'too_late': 0 };
        const aStatus = statusPriority[a.preparationStatus] || 0;
        const bStatus = statusPriority[b.preparationStatus] || 0;
        if (aStatus !== bStatus) return bStatus - aStatus;

        // Finally by date
        return a.daysUntil - b.daysUntil;
      });

      RequestTracker.end(trackingId, true);
      return enhancedRaces;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[ENHANCED_RACE_SERVICE] Error getting upcoming races:', error);
      throw error;
    }
  }

  // Enhanced race search with advanced filtering
  static async searchRaces(filters: RaceSearchFilters): Promise<any[]> {
    const trackingId = RequestTracker.start('enhanced_race_search', undefined, { filters });

    try {
      let query = supabase.from('external_races').select('*');

      // Apply date filters
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('date', filters.startDate || today);
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      // Apply distance type filters
      if (filters.distanceTypes && filters.distanceTypes.length > 0) {
        query = query.in('distance_type', filters.distanceTypes);
      }

      // Apply location filters
      if (filters.location) {
        if (filters.location.city) {
          query = query.ilike('city', `%${filters.location.city}%`);
        }
        if (filters.location.state) {
          query = query.ilike('state', `%${filters.location.state}%`);
        }
        if (filters.location.country) {
          query = query.eq('country', filters.location.country);
        }
      }

      // Apply difficulty filters
      if (filters.difficulty && filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty);
      }

      // Apply price range filters
      if (filters.priceRange) {
        if (filters.priceRange.min !== undefined) {
          query = query.gte('price_min', filters.priceRange.min);
        }
        if (filters.priceRange.max !== undefined) {
          query = query.lte('price_max', filters.priceRange.max);
        }
      }

      // Apply feature filters
      if (filters.features && filters.features.length > 0) {
        // Use overlap operator for array fields
        query = query.overlaps('features', filters.features);
      }

      // Order by date and limit results
      query = query.order('date', { ascending: true }).limit(100);

      const result = await withTimeout(
        withRetry(async () => {
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }, {}, 'race_search_query'),
        TimeoutHandler.getTimeout('database'),
        'race_search_query'
      );

      // Apply location radius filter if coordinates provided
      let filteredResults = result;
      if (filters.location?.latitude && filters.location?.longitude && filters.location?.radius) {
        filteredResults = this.filterByRadius(
          result,
          filters.location.latitude,
          filters.location.longitude,
          filters.location.radius
        );
      }

      // Add countdown calculations to results
      const enhancedResults = filteredResults.map(race => this.enhanceRaceWithCountdown(race));

      RequestTracker.end(trackingId, true);
      return enhancedResults;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[ENHANCED_RACE_SERVICE] Error searching races:', error);
      throw error;
    }
  }

  // Get comprehensive race preparation analysis
  static async getRacePreparationAnalysis(raceId: string): Promise<RacePreparationAnalysis> {
    const trackingId = RequestTracker.start('race_preparation_analysis', undefined, { raceId });

    try {
      // Get race details
      const { data: race, error: raceError } = await supabase
        .from('external_races')
        .select('*')
        .eq('id', raceId)
        .single();

      if (raceError) throw raceError;

      // Get user's training history for context
      const { data: trainingSessions } = await supabase
        .from('training_sessions')
        .select('type, distance, moving_time, date')
        .order('date', { ascending: false })
        .limit(50);

      // Calculate preparation analysis
      const analysis = this.calculatePreparationAnalysis(race, trainingSessions || []);

      RequestTracker.end(trackingId, true);
      return analysis;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[ENHANCED_RACE_SERVICE] Error getting preparation analysis:', error);
      throw error;
    }
  }

  // Get races by distance type with enhanced filtering
  static async getRacesByDistanceType(
    distanceType: string,
    options: {
      limit?: number;
      startDate?: string;
      location?: { city?: string; state?: string };
      sortBy?: 'date' | 'proximity' | 'popularity';
    } = {}
  ): Promise<any[]> {
    const trackingId = RequestTracker.start('races_by_distance_type', undefined, { distanceType, options });

    try {
      let query = supabase
        .from('external_races')
        .select('*')
        .eq('distance_type', distanceType);

      // Apply date filter
      const startDate = options.startDate || new Date().toISOString().split('T')[0];
      query = query.gte('date', startDate);

      // Apply location filter
      if (options.location?.city) {
        query = query.ilike('city', `%${options.location.city}%`);
      }
      if (options.location?.state) {
        query = query.ilike('state', `%${options.location.state}%`);
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'date':
          query = query.order('date', { ascending: true });
          break;
        case 'proximity':
          // Would need user location to implement proximity sorting
          query = query.order('date', { ascending: true });
          break;
        case 'popularity':
          // Could sort by registration count or features
          query = query.order('date', { ascending: true });
          break;
        default:
          query = query.order('date', { ascending: true });
      }

      // Apply limit
      const limit = options.limit || 20;
      query = query.limit(limit);

      const result = await withTimeout(
        withRetry(async () => {
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }, {}, 'races_by_distance_type_query'),
        TimeoutHandler.getTimeout('database'),
        'races_by_distance_type_query'
      );

      // Enhance with countdown calculations
      const enhancedRaces = result.map(race => this.enhanceRaceWithCountdown(race));

      RequestTracker.end(trackingId, true);
      return enhancedRaces;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[ENHANCED_RACE_SERVICE] Error getting races by distance type:', error);
      throw error;
    }
  }

  // Private helper methods

  // Enhance race with countdown calculations and preparation status
  private static enhanceRaceWithCountdown(race: any, userPlannedRace?: any): RaceWithCountdown | null {
    if (!race || !race.date) return null;

    const raceDate = new Date(race.date);
    const today = new Date();
    const timeDiff = raceDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Skip past races
    if (daysUntil < 0) return null;

    const weeksUntil = Math.ceil(daysUntil / 7);
    const monthsUntil = Math.ceil(daysUntil / 30);

    // Get configuration for race distance
    const config = this.RACE_CONFIGS[race.distance_type as keyof typeof this.RACE_CONFIGS] || this.RACE_CONFIGS.olympic;

    // Calculate preparation status
    const preparationStatus = this.calculatePreparationStatus(daysUntil, race.distance_type);
    const preparationWeeksRemaining = Math.max(0, weeksUntil - 1); // Subtract taper week

    // Determine if this is a priority race
    const isPriority = userPlannedRace?.priority <= 2 || userPlannedRace?.status === 'registered';

    // Calculate registration status
    const registrationStatus = this.calculateRegistrationStatus(race);

    return {
      id: race.id,
      name: race.name,
      date: race.date,
      location: race.location || `${race.city}, ${race.state}`,
      city: race.city,
      state: race.state,
      country: race.country,
      distance_type: race.distance_type,
      difficulty: race.difficulty,
      daysUntil,
      weeksUntil,
      monthsUntil,
      isPriority,
      preparationStatus,
      preparationWeeksRemaining,
      idealPrepWeeks: config.idealPrepWeeks,
      registrationStatus,
      userPlanedRace: userPlannedRace
    };
  }

  // Calculate preparation status based on time remaining
  private static calculatePreparationStatus(daysUntil: number, distanceType: string): 'excellent' | 'good' | 'moderate' | 'critical' | 'too_late' {
    const config = this.RACE_CONFIGS[distanceType as keyof typeof this.RACE_CONFIGS] || this.RACE_CONFIGS.olympic;
    const weeksUntil = Math.ceil(daysUntil / 7);

    const { idealPrepWeeks, minPrepWeeks } = config;

    if (weeksUntil >= idealPrepWeeks) return 'excellent';
    if (weeksUntil >= idealPrepWeeks * 0.75) return 'good';
    if (weeksUntil >= minPrepWeeks) return 'moderate';
    if (weeksUntil >= minPrepWeeks * 0.5) return 'critical';
    return 'too_late';
  }

  // Calculate registration status
  private static calculateRegistrationStatus(race: any): 'open' | 'closing_soon' | 'closed' | 'unknown' {
    if (!race.registration_closes) return 'unknown';

    const today = new Date();
    const registrationCloses = new Date(race.registration_closes);
    const daysUntilClose = Math.ceil((registrationCloses.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysUntilClose < 0) return 'closed';
    if (daysUntilClose <= 7) return 'closing_soon';
    return 'open';
  }

  // Filter races by radius (Haversine formula)
  private static filterByRadius(races: any[], userLat: number, userLon: number, radiusMiles: number): any[] {
    return races.filter(race => {
      if (!race.latitude || !race.longitude) return false;

      const distance = this.calculateDistance(userLat, userLon, race.latitude, race.longitude);
      return distance <= radiusMiles;
    });
  }

  // Calculate distance between two points in miles
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate comprehensive preparation analysis
  private static calculatePreparationAnalysis(race: any, trainingSessions: any[]): RacePreparationAnalysis {
    const raceDate = new Date(race.date);
    const today = new Date();
    const daysUntil = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    const weeksUntil = Math.ceil(daysUntil / 7);

    const config = this.RACE_CONFIGS[race.distance_type as keyof typeof this.RACE_CONFIGS] || this.RACE_CONFIGS.olympic;
    const preparationStatus = this.calculatePreparationStatus(daysUntil, race.distance_type);

    // Analyze current training phase
    const currentPhase = this.determineTrainingPhase(weeksUntil, config.idealPrepWeeks);

    // Generate recommendations based on preparation status and time remaining
    const recommendations = this.generatePreparationRecommendations(
      preparationStatus,
      currentPhase,
      weeksUntil,
      race.distance_type,
      trainingSessions
    );

    return {
      raceId: race.id,
      raceName: race.name,
      raceDate: race.date,
      distanceType: race.distance_type,
      daysUntil,
      preparationStatus,
      recommendations,
      trainingPlan: {
        weeksRemaining: Math.max(0, weeksUntil - 1), // Exclude taper week
        currentPhase,
        weeklyHours: config.weeklyHours[currentPhase],
        focusAreas: config.focusAreas
      },
      nutritionPlanning: {
        raceStrategy: this.getNutritionStrategy(race.distance_type),
        practiceRaces: this.getRecommendedPracticeRaces(race.distance_type, weeksUntil),
        supplementTesting: weeksUntil >= 8
      },
      gearPreparation: {
        essentialItems: this.getEssentialGear(race.distance_type),
        optionalItems: this.getOptionalGear(race.distance_type),
        testingNeeded: this.getGearTesting(race.distance_type, weeksUntil)
      }
    };
  }

  // Determine current training phase based on weeks remaining
  private static determineTrainingPhase(weeksUntil: number, idealPrepWeeks: number): 'base' | 'build' | 'peak' | 'taper' | 'recovery' {
    const remainingRatio = weeksUntil / idealPrepWeeks;

    if (weeksUntil <= 1) return 'taper';
    if (weeksUntil <= 3) return 'peak';
    if (remainingRatio <= 0.4) return 'peak';
    if (remainingRatio <= 0.7) return 'build';
    return 'base';
  }

  // Generate preparation recommendations
  private static generatePreparationRecommendations(
    status: string,
    phase: string,
    weeksUntil: number,
    distanceType: string,
    trainingSessions: any[]
  ): string[] {
    const recommendations: string[] = [];

    // Status-based recommendations
    switch (status) {
      case 'excellent':
        recommendations.push('You have excellent preparation time - focus on building a strong aerobic base');
        break;
      case 'good':
        recommendations.push('Good preparation time remaining - maintain consistent training');
        break;
      case 'moderate':
        recommendations.push('Moderate preparation time - prioritize key workouts and stay healthy');
        break;
      case 'critical':
        recommendations.push('Critical preparation period - focus on race-specific fitness');
        break;
      case 'too_late':
        recommendations.push('Very limited preparation time - focus on race strategy and staying injury-free');
        break;
    }

    // Phase-based recommendations
    switch (phase) {
      case 'base':
        recommendations.push('Focus on aerobic base building with longer, easier sessions');
        recommendations.push('Emphasize technique development in all three disciplines');
        break;
      case 'build':
        recommendations.push('Increase training intensity with race-pace intervals');
        recommendations.push('Practice race nutrition and hydration strategies');
        break;
      case 'peak':
        recommendations.push('Maintain fitness with race-specific workouts');
        recommendations.push('Practice race-day routines and equipment');
        break;
      case 'taper':
        recommendations.push('Reduce training volume while maintaining intensity');
        recommendations.push('Focus on rest, nutrition, and mental preparation');
        break;
    }

    // Distance-specific recommendations
    if (distanceType === 'ironman' && weeksUntil >= 16) {
      recommendations.push('Consider a 70.3 race as preparation 8-12 weeks before your Ironman');
    }

    return recommendations;
  }

  // Get nutrition strategy for distance type
  private static getNutritionStrategy(distanceType: string): string {
    const strategies = {
      'sprint': 'Minimal nutrition needed - focus on pre-race meal 3-4 hours before',
      'olympic': 'Sports drink during bike/run, practice race-morning nutrition',
      '70.3': 'Hourly nutrition plan with 200-300 calories/hour after first hour',
      'ironman': 'Comprehensive nutrition plan with 250-350 calories/hour for bike and run'
    };

    return strategies[distanceType as keyof typeof strategies] || strategies.olympic;
  }

  // Get recommended practice races
  private static getRecommendedPracticeRaces(distanceType: string, weeksUntil: number): string[] {
    if (weeksUntil < 8) return [];

    const practiceRaces = {
      'sprint': ['5K run', 'Sprint triathlon'],
      'olympic': ['Sprint triathlon', '10K run', 'Olympic triathlon'],
      '70.3': ['Sprint triathlon', 'Olympic triathlon', '70.3 triathlon'],
      'ironman': ['Olympic triathlon', '70.3 triathlon', 'Marathon']
    };

    return practiceRaces[distanceType as keyof typeof practiceRaces] || practiceRaces.olympic;
  }

  // Get essential gear for distance type
  private static getEssentialGear(distanceType: string): string[] {
    const baseGear = ['Wetsuit (if legal)', 'Goggles', 'Bike', 'Helmet', 'Running shoes', 'Race kit'];

    const distanceSpecific = {
      'sprint': [],
      'olympic': ['Bike computer', 'Hydration system'],
      '70.3': ['Bike computer', 'Hydration system', 'Nutrition storage', 'Sunglasses'],
      'ironman': ['Bike computer', 'Hydration system', 'Nutrition storage', 'Sunglasses', 'Bike lights', 'Spare tubes']
    };

    return [...baseGear, ...(distanceSpecific[distanceType as keyof typeof distanceSpecific] || [])];
  }

  // Get optional gear for distance type
  private static getOptionalGear(distanceType: string): string[] {
    const optionalGear = {
      'sprint': ['Heart rate monitor', 'Trisuit'],
      'olympic': ['Power meter', 'Aerobars', 'Trisuit'],
      '70.3': ['Power meter', 'Aerobars', 'Compression wear', 'Recovery tools'],
      'ironman': ['Power meter', 'Aerobars', 'Compression wear', 'Recovery tools', 'Bike fit']
    };

    return optionalGear[distanceType as keyof typeof optionalGear] || optionalGear.olympic;
  }

  // Get gear testing recommendations
  private static getGearTesting(distanceType: string, weeksUntil: number): string[] {
    const testing: string[] = [];

    if (weeksUntil >= 12) {
      testing.push('Test wetsuit in open water');
      testing.push('Practice race-day nutrition');
    }

    if (weeksUntil >= 8) {
      testing.push('Bike fit optimization');
      testing.push('Race kit comfort testing');
    }

    if (weeksUntil >= 4) {
      testing.push('Final gear shakedown');
      testing.push('Race-day timing practice');
    }

    return testing;
  }
}