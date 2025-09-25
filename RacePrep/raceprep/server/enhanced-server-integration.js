// Enhanced Server Integration Example
// This file demonstrates how to integrate the enhanced backend services into the existing server

const express = require('express');

// Enhanced API endpoints using the new backend services
// These would be added to the existing server.js file

// Import enhanced services (would need to be transpiled from TypeScript)
// const {
//   performanceMonitor,
//   createPerformanceMiddleware,
//   EnhancedRaceDataService,
//   EnhancedStravaApiService,
//   EnhancedGoalsService,
//   requestBatcher,
//   withRetry,
//   withTimeout,
//   TimeoutHandler
// } = require('../src/services/enhanced');

// Performance monitoring middleware
function setupPerformanceMonitoring(app) {
  // Add performance monitoring middleware to all routes
  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const isError = res.statusCode >= 400;

      // Track request performance
      console.log(`[REQUEST] ${req.method} ${req.path} - ${duration}ms - Status: ${res.statusCode}`);

      // In real implementation, would call:
      // performanceMonitor.trackRequest(duration, isError);
    });

    next();
  });
}

// Enhanced dashboard data endpoint with request batching
function setupEnhancedDashboardEndpoints(app) {
  // Enhanced dashboard data endpoint
  app.get('/api/enhanced/dashboard', async (req, res) => {
    try {
      const userId = req.query.user_id || req.headers['x-user-id'];
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log('[ENHANCED_DASHBOARD] Loading dashboard data with batching...');
      const startTime = Date.now();

      // In real implementation, would use:
      // const dashboardData = await requestBatcher.loadDashboardData(userId);

      // Mock response for demonstration
      const dashboardData = {
        userProfile: { id: userId, name: 'Test User' },
        userSettings: { distance_units: 'imperial' },
        upcomingRaces: [
          {
            id: '1',
            name: 'Test Triathlon',
            date: '2024-06-15',
            daysUntil: 45,
            preparationStatus: 'good'
          }
        ],
        trainingStats: {
          weeklyStats: { totalTime: 18000, totalDistance: 50000 },
          consistency: 85
        },
        goalProgress: {
          activeGoals: 3,
          completedGoals: 1,
          avgProgress: 65
        },
        recentActivities: [
          { type: 'run', distance: 10000, duration: 2400 },
          { type: 'bike', distance: 25000, duration: 3600 }
        ]
      };

      const duration = Date.now() - startTime;
      console.log(`[ENHANCED_DASHBOARD] Dashboard data loaded in ${duration}ms`);

      res.json({
        success: true,
        data: dashboardData,
        performance: {
          loadTime: duration,
          cached: false,
          batchedRequests: 6
        }
      });
    } catch (error) {
      console.error('[ENHANCED_DASHBOARD] Error:', error);
      res.status(500).json({
        error: 'Failed to load dashboard data',
        details: error.message
      });
    }
  });

  // Enhanced race search with preparation analysis
  app.get('/api/enhanced/races/search', async (req, res) => {
    try {
      const filters = {
        distanceTypes: req.query.distance_types ? req.query.distance_types.split(',') : undefined,
        location: {
          city: req.query.city,
          state: req.query.state,
          radius: req.query.radius ? parseInt(req.query.radius) : undefined
        },
        startDate: req.query.start_date,
        endDate: req.query.end_date
      };

      console.log('[ENHANCED_RACE_SEARCH] Searching with filters:', filters);

      // In real implementation, would use:
      // const races = await EnhancedRaceDataService.searchRaces(filters);

      // Mock response
      const races = [
        {
          id: '1',
          name: 'Olympic Triathlon Championship',
          date: '2024-07-20',
          location: 'Austin, TX',
          distance_type: 'olympic',
          daysUntil: 89,
          preparationStatus: 'excellent',
          preparationWeeksRemaining: 12,
          registrationStatus: 'open'
        },
        {
          id: '2',
          name: 'Ironman Texas',
          date: '2024-05-18',
          location: 'The Woodlands, TX',
          distance_type: 'ironman',
          daysUntil: 137,
          preparationStatus: 'good',
          preparationWeeksRemaining: 19,
          registrationStatus: 'open'
        }
      ];

      res.json({
        success: true,
        data: races,
        filters: filters,
        count: races.length
      });
    } catch (error) {
      console.error('[ENHANCED_RACE_SEARCH] Error:', error);
      res.status(500).json({
        error: 'Failed to search races',
        details: error.message
      });
    }
  });

  // Enhanced race preparation analysis
  app.get('/api/enhanced/races/:raceId/preparation', async (req, res) => {
    try {
      const { raceId } = req.params;

      console.log(`[RACE_PREPARATION] Analyzing preparation for race ${raceId}`);

      // In real implementation, would use:
      // const analysis = await EnhancedRaceDataService.getRacePreparationAnalysis(raceId);

      // Mock response
      const analysis = {
        raceId,
        raceName: 'Olympic Triathlon Championship',
        raceDate: '2024-07-20',
        distanceType: 'olympic',
        daysUntil: 89,
        preparationStatus: 'excellent',
        recommendations: [
          'You have excellent preparation time - focus on building a strong aerobic base',
          'Focus on aerobic base building with longer, easier sessions',
          'Emphasize technique development in all three disciplines'
        ],
        trainingPlan: {
          weeksRemaining: 12,
          currentPhase: 'base',
          weeklyHours: 8,
          focusAreas: ['endurance', 'technique', 'race_pace']
        },
        nutritionPlanning: {
          raceStrategy: 'Sports drink during bike/run, practice race-morning nutrition',
          practiceRaces: ['Sprint triathlon', '10K run'],
          supplementTesting: true
        },
        gearPreparation: {
          essentialItems: ['Wetsuit (if legal)', 'Goggles', 'Bike', 'Helmet', 'Running shoes'],
          optionalItems: ['Power meter', 'Aerobars', 'Trisuit'],
          testingNeeded: ['Test wetsuit in open water', 'Practice race-day nutrition']
        }
      };

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('[RACE_PREPARATION] Error:', error);
      res.status(500).json({
        error: 'Failed to analyze race preparation',
        details: error.message
      });
    }
  });
}

// Enhanced Strava integration endpoints
function setupEnhancedStravaEndpoints(app) {
  // Enhanced Strava sync with progress tracking
  app.post('/api/enhanced/strava/sync', async (req, res) => {
    try {
      const { user_id, access_token } = req.body;

      if (!user_id || !access_token) {
        return res.status(400).json({ error: 'User ID and access token required' });
      }

      console.log(`[ENHANCED_STRAVA] Starting sync for user ${user_id}`);

      // In real implementation, would use:
      // const syncId = await EnhancedStravaApiService.syncActivitiesWithProgress(user_id, {
      //   onProgress: (progress) => {
      //     console.log(`[STRAVA_SYNC] Progress: ${progress.processedActivities}/${progress.totalActivities}`);
      //   }
      // });

      // Mock response
      const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({
        success: true,
        syncId,
        message: 'Sync started successfully',
        statusEndpoint: `/api/enhanced/strava/sync/${syncId}/status`
      });
    } catch (error) {
      console.error('[ENHANCED_STRAVA] Sync error:', error);
      res.status(500).json({
        error: 'Failed to start Strava sync',
        details: error.message
      });
    }
  });

  // Strava sync status endpoint
  app.get('/api/enhanced/strava/sync/:syncId/status', async (req, res) => {
    try {
      const { syncId } = req.params;

      // In real implementation, would use:
      // const progress = EnhancedStravaApiService.getSyncProgress(syncId);

      // Mock response
      const progress = {
        syncId,
        status: 'completed',
        totalActivities: 45,
        processedActivities: 45,
        successfulActivities: 42,
        failedActivities: 3,
        currentStep: 'Sync completed successfully',
        startedAt: new Date(Date.now() - 30000).toISOString(),
        completedAt: new Date().toISOString(),
        errors: [
          { id: '123', error: 'Invalid distance value' },
          { id: '456', error: 'Missing activity type' },
          { id: '789', error: 'Unsupported activity type' }
        ]
      };

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('[ENHANCED_STRAVA] Status error:', error);
      res.status(500).json({
        error: 'Failed to get sync status',
        details: error.message
      });
    }
  });

  // Enhanced Strava analytics
  app.get('/api/enhanced/strava/analytics', async (req, res) => {
    try {
      const { user_id, weeks = 12 } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log(`[ENHANCED_STRAVA] Getting analytics for user ${user_id}, ${weeks} weeks`);

      // In real implementation, would use:
      // const analytics = await EnhancedStravaApiService.getTrainingAnalytics(user_id, parseInt(weeks));

      // Mock response
      const analytics = {
        weeklyStats: [
          {
            week: '2024-01-01',
            totalDistance: 75000,
            totalTime: 18000,
            activityCount: 8,
            swim: { distance: 5000, time: 2400, count: 2 },
            bike: { distance: 50000, time: 10800, count: 3 },
            run: { distance: 20000, time: 4800, count: 3 }
          }
        ],
        monthlyTrends: [
          { month: '2024-01', trend: 'increasing', changePercent: 15 }
        ],
        performanceInsights: {
          consistency: 85,
          improvementAreas: ['Swim frequency'],
          recommendations: ['Increase swim training to 2-3 sessions per week']
        }
      };

      res.json({
        success: true,
        data: analytics,
        period: { weeks: parseInt(weeks) }
      });
    } catch (error) {
      console.error('[ENHANCED_STRAVA] Analytics error:', error);
      res.status(500).json({
        error: 'Failed to get Strava analytics',
        details: error.message
      });
    }
  });
}

// Enhanced goals endpoints
function setupEnhancedGoalsEndpoints(app) {
  // Get goals with enhanced progress
  app.get('/api/enhanced/goals', async (req, res) => {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log(`[ENHANCED_GOALS] Getting goals for user ${user_id}`);

      // In real implementation, would use:
      // const goals = await EnhancedGoalsService.getAllGoalsWithProgress();

      // Mock response
      const goals = [
        {
          id: '1',
          title: 'Complete 5 races this year',
          goal_type: 'race_count',
          target_value: '5',
          current_value: '2',
          progressPercentage: 40,
          progressStatus: 'on_track',
          urgency: 'medium',
          trend: 'improving',
          daysUntilTarget: 200,
          recommendations: ['Look for upcoming races that fit your schedule'],
          insights: ['Great progress - you\'re past the halfway point'],
          milestones: [
            { title: 'First Race', percentage: 20, achieved: true },
            { title: 'Halfway Point', percentage: 50, achieved: false }
          ]
        }
      ];

      res.json({
        success: true,
        data: goals,
        count: goals.length
      });
    } catch (error) {
      console.error('[ENHANCED_GOALS] Error:', error);
      res.status(500).json({
        error: 'Failed to get goals',
        details: error.message
      });
    }
  });

  // Goal analytics
  app.get('/api/enhanced/goals/analytics', async (req, res) => {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log(`[ENHANCED_GOALS] Getting analytics for user ${user_id}`);

      // In real implementation, would use:
      // const analytics = await EnhancedGoalsService.getGoalAnalytics();

      // Mock response
      const analytics = {
        totalGoals: 5,
        activeGoals: 3,
        completedGoals: 2,
        overdueGoals: 0,
        averageCompletionTime: 45,
        successRate: 85,
        consistencyScore: 75,
        improvementTrends: {
          timeTargets: 12,
          distanceTargets: 8,
          consistencyTargets: 15
        },
        recommendations: [
          'Focus on goals that are falling behind schedule',
          'Set more challenging distance targets'
        ]
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('[ENHANCED_GOALS] Analytics error:', error);
      res.status(500).json({
        error: 'Failed to get goal analytics',
        details: error.message
      });
    }
  });
}

// Performance monitoring endpoints
function setupPerformanceEndpoints(app) {
  // Health check with enhanced metrics
  app.get('/api/enhanced/health', (req, res) => {
    try {
      // In real implementation, would use:
      // const healthStatus = EnhancedBackendServices.getHealthStatus();

      // Mock response
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          performance_monitor: 'up',
          connection_pool: 'up',
          request_batcher: 'up',
          database: 'up'
        },
        metrics: {
          performance: {
            status: 'healthy',
            score: 92,
            issues: [],
            improvements: []
          },
          connections: {
            totalConnections: 10,
            activeConnections: 3,
            avgQueryTime: 45,
            cacheHitRate: 78
          },
          cache: {
            size: 245,
            keys: ['user_profile', 'training_stats', 'goal_progress']
          }
        },
        alerts: []
      };

      res.json(healthStatus);
    } catch (error) {
      console.error('[HEALTH_CHECK] Error:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Performance metrics endpoint
  app.get('/api/enhanced/metrics', (req, res) => {
    try {
      // In real implementation, would use:
      // const metrics = EnhancedBackendServices.getMetrics();

      // Mock response
      const metrics = {
        performance: {
          timestamp: new Date().toISOString(),
          responseTime: 125,
          throughput: 15.5,
          errorRate: 1.2,
          memoryUsage: { used: 245, total: 512, percentage: 47.8 }
        },
        database: {
          totalConnections: 10,
          activeConnections: 3,
          queuedRequests: 0,
          avgQueryTime: 45
        },
        cache: {
          size: 245,
          hitRate: 78.5
        },
        requests: {
          USER_PROFILE: 0,
          TRAINING_STATS: 1,
          GOAL_PROGRESS: 0
        }
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('[METRICS] Error:', error);
      res.status(500).json({
        error: 'Failed to get metrics',
        details: error.message
      });
    }
  });

  // Performance diagnostics export
  app.get('/api/enhanced/diagnostics', (req, res) => {
    try {
      // In real implementation, would use:
      // const diagnostics = EnhancedBackendServices.exportDiagnostics();

      // Mock response
      const diagnostics = {
        timestamp: new Date().toISOString(),
        health: { status: 'healthy' },
        metrics: { performance: {}, database: {}, cache: {} },
        recommendations: [
          {
            type: 'caching',
            priority: 'medium',
            title: 'Optimize cache strategy',
            description: 'Cache hit rate could be improved'
          }
        ],
        configuration: {
          initialized: true,
          monitoringActive: true
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="raceprep-diagnostics.json"');
      res.send(JSON.stringify(diagnostics, null, 2));
    } catch (error) {
      console.error('[DIAGNOSTICS] Error:', error);
      res.status(500).json({
        error: 'Failed to export diagnostics',
        details: error.message
      });
    }
  });
}

// Setup all enhanced endpoints
function setupEnhancedEndpoints(app) {
  console.log('[ENHANCED_SERVER] Setting up enhanced endpoints...');

  setupPerformanceMonitoring(app);
  setupEnhancedDashboardEndpoints(app);
  setupEnhancedStravaEndpoints(app);
  setupEnhancedGoalsEndpoints(app);
  setupEnhancedRaceEndpoints(app);
  setupPerformanceEndpoints(app);

  console.log('[ENHANCED_SERVER] All enhanced endpoints configured');
}

function setupEnhancedRaceEndpoints(app) {
  // Enhanced upcoming races with countdown
  app.get('/api/enhanced/races/upcoming', async (req, res) => {
    try {
      const { user_id, limit = 5 } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log(`[ENHANCED_RACES] Getting upcoming races for user ${user_id}`);

      // Mock response with enhanced race data
      const races = [
        {
          id: '1',
          name: 'Austin Triathlon',
          date: '2024-04-15',
          location: 'Austin, TX',
          distance_type: 'olympic',
          daysUntil: 67,
          weeksUntil: 10,
          preparationStatus: 'good',
          preparationWeeksRemaining: 9,
          isPriority: true,
          urgency: 'medium',
          registrationStatus: 'open'
        }
      ];

      res.json({
        success: true,
        data: races,
        count: races.length
      });
    } catch (error) {
      console.error('[ENHANCED_RACES] Error:', error);
      res.status(500).json({
        error: 'Failed to get upcoming races',
        details: error.message
      });
    }
  });
}

// Export setup function
module.exports = {
  setupEnhancedEndpoints,
  setupPerformanceMonitoring,
  setupEnhancedDashboardEndpoints,
  setupEnhancedStravaEndpoints,
  setupEnhancedGoalsEndpoints,
  setupEnhancedRaceEndpoints,
  setupPerformanceEndpoints
};

// Example of how to integrate into existing server:
/*
const express = require('express');
const { setupEnhancedEndpoints } = require('./enhanced-server-integration');

const app = express();

// ... existing middleware and routes ...

// Add enhanced endpoints
setupEnhancedEndpoints(app);

// ... rest of server setup ...
*/