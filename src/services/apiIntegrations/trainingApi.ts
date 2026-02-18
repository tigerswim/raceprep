import { dbHelpers } from '../supabase';
import { logger } from '../../utils/logger';
import { rateLimiter } from './rateLimiter';
import { StravaTrainingAPIService } from './stravaApi';

// Training Events API Integration
export class TrainingEventsService {

  // Meetup API integration
  static async syncMeetupEvents(city: string = 'Austin', state: string = 'TX') {
    if (!rateLimiter.canMakeRequest('meetup', 200)) {
      throw new Error('Rate limit exceeded for Meetup API');
    }

    try {
      // Sample Meetup data
      const sampleEvents = [
        {
          external_id: 'meetup_123',
          api_source: 'meetup',
          title: 'Open Water Swim Clinic - Lake Michigan',
          description: 'Join experienced open water swimmers for technique clinic and group swim. All skill levels welcome.',
          event_type: 'clinic',
          date: '2024-04-20',
          time: '07:00:00',
          duration_minutes: 90,
          location: 'Oak Street Beach, Chicago, IL',
          city: 'Chicago',
          state: 'IL',
          country: 'US',
          latitude: 41.9028,
          longitude: -87.6317,
          organizer_name: 'Chicago Triathlon Club',
          organizer_contact: 'info@chicagotri.com',
          event_url: 'https://www.meetup.com/chicago-tri/events/open-water-clinic',
          price: 15.00,
          currency: 'USD',
          spots_available: 12,
          skill_level: 'all',
          disciplines: ['swim']
        },
        {
          external_id: 'meetup_124',
          api_source: 'meetup',
          title: 'Brick Workout Training Session',
          description: 'Bike-to-run transition practice with structured intervals. Bring bike and running gear.',
          event_type: 'group_training',
          date: '2024-04-25',
          time: '06:00:00',
          duration_minutes: 120,
          location: 'Zilker Park, Austin, TX',
          city: 'Austin',
          state: 'TX',
          country: 'US',
          latitude: 30.2672,
          longitude: -97.7431,
          organizer_name: 'Austin Triathlon Group',
          organizer_contact: 'coach@austintri.com',
          event_url: 'https://www.meetup.com/austin-tri/events/brick-workout',
          price: 0.00,
          currency: 'USD',
          spots_available: 8,
          skill_level: 'intermediate',
          disciplines: ['bike', 'run', 'transition']
        }
      ];

      for (const event of sampleEvents) {
        const { error } = await dbHelpers.trainingEvents.create(event);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting event:', error);
        }
      }

      return { success: true, count: sampleEvents.length };
    } catch (error) {
      logger.error('Meetup API sync failed:', error);
      throw error;
    }
  }
}

// Enhanced Training Data Sync Service
export class TrainingDataSyncService {

  // Sync Strava training data with progress tracking
  static async syncStravaData(accessToken: string, onProgress?: (progress: any) => void) {
    try {
      logger.debug('Starting Strava training data sync...');

      const result = await StravaTrainingAPIService.syncActivitiesWithProgress(accessToken, {
        perPage: 200,
        onProgress
      });

      logger.debug('Strava sync initiated:', result);
      return result;
    } catch (error) {
      logger.error('Strava sync error:', error);
      throw error;
    }
  }

  // Get comprehensive training analytics
  static async getTrainingAnalytics(accessToken: string) {
    try {
      const [weeklyData, monthlyData] = await Promise.all([
        StravaTrainingAPIService.getWeeklyAnalytics(accessToken, 8),
        StravaTrainingAPIService.getMonthlyAnalytics(accessToken, 6)
      ]);

      const insights = StravaTrainingAPIService.generateTrainingInsights(weeklyData.weeks);

      return {
        weekly: weeklyData,
        monthly: monthlyData,
        insights,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Training analytics error:', error);
      throw error;
    }
  }

  // Refresh Strava tokens automatically
  static async refreshStravaToken(refreshToken: string) {
    try {
      return await StravaTrainingAPIService.refreshToken(refreshToken);
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }
}

// Training Performance Analysis Service
export class TrainingPerformanceService {

  // Analyze training periodization
  static analyzeTrainingPeriodization(monthlyData: any[]) {
    if (monthlyData.length < 3) {
      return {
        phase: 'insufficient_data',
        recommendation: 'Need at least 3 months of data for periodization analysis'
      };
    }

    const volumes = monthlyData.map(month => month.total.distance);
    const recentVolume = volumes.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    const historicalVolume = volumes.slice(2).reduce((a, b) => a + b, 0) / (volumes.length - 2);

    const volumeChange = ((recentVolume - historicalVolume) / historicalVolume) * 100;

    let phase = 'maintenance';
    let recommendation = 'Continue current training load';

    if (volumeChange > 20) {
      phase = 'build';
      recommendation = 'Monitor fatigue levels during build phase';
    } else if (volumeChange < -20) {
      phase = 'recovery';
      recommendation = 'Good time for recovery and technique focus';
    } else if (volumeChange > 10) {
      phase = 'progressive_build';
      recommendation = 'Gradual volume increase - sustainable approach';
    }

    return {
      phase,
      recommendation,
      volumeChange: Math.round(volumeChange),
      recentVolume: Math.round(recentVolume / 1000), // km
      historicalVolume: Math.round(historicalVolume / 1000) // km
    };
  }

  // Calculate training stress balance
  static calculateTrainingStress(activities: any[]) {
    let totalStress = 0;
    let stressfulSessions = 0;

    activities.forEach(activity => {
      if (activity.suffer_score) {
        totalStress += activity.suffer_score;
        stressfulSessions++;
      }
    });

    const avgStress = stressfulSessions > 0 ? totalStress / stressfulSessions : 0;

    let stressLevel = 'moderate';
    let advice = 'Balanced training stress';

    if (avgStress > 80) {
      stressLevel = 'high';
      advice = 'Consider adding more recovery sessions';
    } else if (avgStress < 40) {
      stressLevel = 'low';
      advice = 'Could benefit from some higher intensity sessions';
    }

    return {
      avgStress: Math.round(avgStress),
      totalStress: Math.round(totalStress),
      stressLevel,
      advice,
      sessionsWithData: stressfulSessions
    };
  }

  // Identify training patterns
  static identifyTrainingPatterns(weeklyData: any[]) {
    const patterns = {
      consistency: 0,
      preferredDays: [] as string[],
      disciplineBalance: {
        swim: 0,
        bike: 0,
        run: 0
      },
      insights: [] as string[]
    };

    if (weeklyData.length === 0) return patterns;

    // Calculate consistency (percentage of weeks with at least 3 sessions)
    const consistentWeeks = weeklyData.filter(week => week.total.sessions >= 3).length;
    patterns.consistency = Math.round((consistentWeeks / weeklyData.length) * 100);

    // Calculate discipline balance
    const totalSessions = weeklyData.reduce((sum, week) => sum + week.total.sessions, 0);
    if (totalSessions > 0) {
      patterns.disciplineBalance.swim = Math.round((weeklyData.reduce((sum, week) => sum + week.swim.sessions, 0) / totalSessions) * 100);
      patterns.disciplineBalance.bike = Math.round((weeklyData.reduce((sum, week) => sum + week.bike.sessions, 0) / totalSessions) * 100);
      patterns.disciplineBalance.run = Math.round((weeklyData.reduce((sum, week) => sum + week.run.sessions, 0) / totalSessions) * 100);
    }

    // Generate insights
    if (patterns.consistency > 80) {
      patterns.insights.push('Excellent training consistency');
    } else if (patterns.consistency < 50) {
      patterns.insights.push('Focus on improving training consistency');
    }

    if (patterns.disciplineBalance.swim < 20) {
      patterns.insights.push('Consider increasing swim training frequency');
    }

    if (patterns.disciplineBalance.bike > 50) {
      patterns.insights.push('Bike-focused training - good for cycling strength');
    }

    if (patterns.disciplineBalance.run < 30) {
      patterns.insights.push('Running could use more attention in your training plan');
    }

    return patterns;
  }

  // Generate comprehensive performance report
  static generatePerformanceReport(analytics: any) {
    const { weekly, monthly } = analytics;

    const periodization = this.analyzeTrainingPeriodization(monthly.months);
    const stress = this.calculateTrainingStress(weekly.weeks.flatMap((week: any) => week.activities || []));
    const patterns = this.identifyTrainingPatterns(weekly.weeks);

    return {
      summary: {
        totalWeeks: weekly.weeks.length,
        totalMonths: monthly.months.length,
        currentPhase: periodization.phase,
        consistency: patterns.consistency
      },
      periodization,
      trainingStress: stress,
      patterns,
      recommendations: [
        periodization.recommendation,
        stress.advice,
        ...patterns.insights
      ].filter(Boolean),
      generatedAt: new Date().toISOString()
    };
  }
}
