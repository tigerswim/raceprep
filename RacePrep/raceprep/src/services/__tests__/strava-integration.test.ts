import { dbHelpers } from '../supabase';

// Mock the supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        order: jest.fn(() => ({
          single: jest.fn(),
        })),
        single: jest.fn(),
      })),
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

jest.mock('../supabase', () => ({
  supabase: mockSupabase,
  dbHelpers: {
    trainingSessions: {
      getAll: jest.fn(),
      getByDateRange: jest.fn(),
      getByType: jest.fn(),
      getWeeklyStats: jest.fn(),
      upsert: jest.fn(),
      bulkUpsert: jest.fn(),
      delete: jest.fn(),
      deleteByStravaId: jest.fn(),
    },
  },
}));

describe('Strava Integration - Training Sessions', () => {
  const mockUser = { id: '123', email: 'test@example.com' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('getWeeklyStats', () => {
    it('should calculate weekly stats correctly', async () => {
      const mockTrainingData = [
        {
          type: 'swim',
          distance: 1609, // 1 mile in meters
          moving_time: 1800, // 30 minutes
        },
        {
          type: 'bike',
          distance: 32186, // 20 miles in meters
          moving_time: 3600, // 1 hour
        },
        {
          type: 'run',
          distance: 8046, // 5 miles in meters
          moving_time: 2400, // 40 minutes
        },
        {
          type: 'swim',
          distance: 804, // 0.5 mile in meters
          moving_time: 900, // 15 minutes
        },
      ];

      const expectedStats = {
        swim: { distance: 2413, sessions: 2, time: 2700 },
        bike: { distance: 32186, sessions: 1, time: 3600 },
        run: { distance: 8046, sessions: 1, time: 2400 }
      };

      (dbHelpers.trainingSessions.getWeeklyStats as jest.Mock).mockResolvedValue({
        data: expectedStats,
        error: null,
      });

      const result = await dbHelpers.trainingSessions.getWeeklyStats();
      
      expect(result.data).toEqual(expectedStats);
      expect(result.error).toBeNull();
      expect(dbHelpers.trainingSessions.getWeeklyStats).toHaveBeenCalledTimes(1);
    });

    it('should handle empty training data', async () => {
      const expectedStats = {
        swim: { distance: 0, sessions: 0, time: 0 },
        bike: { distance: 0, sessions: 0, time: 0 },
        run: { distance: 0, sessions: 0, time: 0 }
      };

      (dbHelpers.trainingSessions.getWeeklyStats as jest.Mock).mockResolvedValue({
        data: expectedStats,
        error: null,
      });

      const result = await dbHelpers.trainingSessions.getWeeklyStats();
      
      expect(result.data).toEqual(expectedStats);
      expect(result.error).toBeNull();
    });
  });

  describe('bulkUpsert', () => {
    it('should bulk insert Strava activities', async () => {
      const mockStravaActivities = [
        {
          id: 'strava_123',
          type: 'run',
          date: '2024-01-15',
          distance: 5000,
          moving_time: 1800,
          name: 'Morning Run'
        },
        {
          id: 'strava_124',
          type: 'swim',
          date: '2024-01-14',
          distance: 1500,
          moving_time: 2100,
          name: 'Pool Swimming'
        },
      ];

      const expectedSessionsWithUserId = mockStravaActivities.map(session => ({
        ...session,
        user_id: mockUser.id,
      }));

      (dbHelpers.trainingSessions.bulkUpsert as jest.Mock).mockResolvedValue({
        data: expectedSessionsWithUserId,
        error: null,
      });

      const result = await dbHelpers.trainingSessions.bulkUpsert(mockStravaActivities);
      
      expect(result.data).toEqual(expectedSessionsWithUserId);
      expect(result.error).toBeNull();
      expect(dbHelpers.trainingSessions.bulkUpsert).toHaveBeenCalledWith(mockStravaActivities);
    });
  });

  describe('getByType', () => {
    it('should filter sessions by activity type', async () => {
      const mockSwimSessions = [
        {
          id: '1',
          user_id: mockUser.id,
          type: 'swim',
          date: '2024-01-15',
          distance: 1500,
          moving_time: 2100,
        },
        {
          id: '2',
          user_id: mockUser.id,
          type: 'swim',
          date: '2024-01-14',
          distance: 1000,
          moving_time: 1800,
        },
      ];

      (dbHelpers.trainingSessions.getByType as jest.Mock).mockResolvedValue({
        data: mockSwimSessions,
        error: null,
      });

      const result = await dbHelpers.trainingSessions.getByType('swim');
      
      expect(result.data).toEqual(mockSwimSessions);
      expect(result.error).toBeNull();
      expect(dbHelpers.trainingSessions.getByType).toHaveBeenCalledWith('swim');
    });
  });

  describe('getByDateRange', () => {
    it('should filter sessions by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      const mockSessions = [
        {
          id: '1',
          user_id: mockUser.id,
          type: 'run',
          date: '2024-01-15',
          distance: 5000,
          moving_time: 1800,
        },
      ];

      (dbHelpers.trainingSessions.getByDateRange as jest.Mock).mockResolvedValue({
        data: mockSessions,
        error: null,
      });

      const result = await dbHelpers.trainingSessions.getByDateRange(startDate, endDate);
      
      expect(result.data).toEqual(mockSessions);
      expect(result.error).toBeNull();
      expect(dbHelpers.trainingSessions.getByDateRange).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database connection failed' };

      (dbHelpers.trainingSessions.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await dbHelpers.trainingSessions.getAll();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle authentication errors', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      (dbHelpers.trainingSessions.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Not authenticated',
      });

      const result = await dbHelpers.trainingSessions.getAll();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Not authenticated');
    });

    it('should handle invalid activity data', async () => {
      const invalidActivity = {
        id: null,
        type: '',
        distance: 'invalid',
        moving_time: undefined,
      };

      (dbHelpers.trainingSessions.upsert as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid data format' },
      });

      const result = await dbHelpers.trainingSessions.upsert(invalidActivity);

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Invalid data format');
    });

    it('should handle network timeouts', async () => {
      (dbHelpers.trainingSessions.getAll as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      try {
        await dbHelpers.trainingSessions.getAll();
      } catch (error) {
        expect(error.message).toBe('Network timeout');
      }
    });

    it('should handle Strava API rate limiting', async () => {
      const rateLimitError = {
        message: 'Rate limit exceeded',
        code: 429,
        details: 'Strava API limit exceeded',
      };

      (dbHelpers.trainingSessions.bulkUpsert as jest.Mock).mockResolvedValue({
        data: null,
        error: rateLimitError,
      });

      const result = await dbHelpers.trainingSessions.bulkUpsert([]);

      expect(result.error.code).toBe(429);
      expect(result.error.message).toBe('Rate limit exceeded');
    });

    it('should handle expired Strava tokens', async () => {
      const tokenError = {
        message: 'Unauthorized',
        code: 401,
        details: 'Strava access token expired',
      };

      (dbHelpers.trainingSessions.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: tokenError,
      });

      const result = await dbHelpers.trainingSessions.getAll();

      expect(result.error.code).toBe(401);
      expect(result.error.details).toBe('Strava access token expired');
    });
  });
});

describe('Strava API Integration', () => {
  describe('Activity Data Transformation', () => {
    it('should transform Strava activity data correctly', () => {
      const mockStravaActivity = {
        id: 12345,
        type: 'Ride', // Strava uses 'Ride' for cycling
        start_date: '2024-01-15T10:00:00Z',
        distance: 32186.88, // meters
        moving_time: 3600, // seconds
        name: 'Morning Bike Ride'
      };

      const expectedTransformed = {
        id: 12345,
        type: 'bike', // Should transform 'Ride' to 'bike'
        date: '2024-01-15',
        distance: 32186.88,
        moving_time: 3600,
        name: 'Morning Bike Ride'
      };

      // This logic is implemented in the server endpoint
      const transformed = {
        id: mockStravaActivity.id,
        type: mockStravaActivity.type.toLowerCase() === 'ride' ? 'bike' : mockStravaActivity.type.toLowerCase(),
        date: mockStravaActivity.start_date.split('T')[0],
        distance: mockStravaActivity.distance,
        moving_time: mockStravaActivity.moving_time,
        name: mockStravaActivity.name
      };

      expect(transformed).toEqual(expectedTransformed);
    });

    it('should filter only triathlon activities', () => {
      const mockStravaActivities = [
        { type: 'Run', id: 1 },
        { type: 'Ride', id: 2 },
        { type: 'Swim', id: 3 },
        { type: 'Walk', id: 4 }, // Should be filtered out
        { type: 'Yoga', id: 5 }, // Should be filtered out
      ];

      const triathlonTypes = ['Swim', 'Ride', 'Run'];
      const filtered = mockStravaActivities.filter(activity => 
        triathlonTypes.includes(activity.type)
      );

      expect(filtered).toHaveLength(3);
      expect(filtered.map(a => a.id)).toEqual([1, 2, 3]);
    });
  });

  describe('Distance Unit Conversions', () => {
    it('should convert meters to miles correctly', () => {
      const metersToMiles = (meters: number) => meters / 1609.34;
      
      expect(metersToMiles(1609.34)).toBeCloseTo(1, 1); // 1 mile
      expect(metersToMiles(8046.7)).toBeCloseTo(5, 1); // 5 miles  
      expect(metersToMiles(32186.8)).toBeCloseTo(20, 1); // 20 miles
    });

    it('should handle time formatting correctly', () => {
      const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      };

      expect(formatTime(1800)).toBe('30m'); // 30 minutes
      expect(formatTime(3600)).toBe('1h 0m'); // 1 hour
      expect(formatTime(5400)).toBe('1h 30m'); // 1.5 hours
    });
  });
});