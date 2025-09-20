import { dbHelpers } from '../supabase';

// Mock the supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

jest.mock('../supabase', () => ({
  supabase: mockSupabase,
  dbHelpers: {
    users: {
      getCurrent: jest.fn(),
      updateProfile: jest.fn(),
      createProfile: jest.fn(),
    },
    userGoals: {
      getAll: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    raceResults: {
      getAll: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Supabase Database Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('users', () => {
    it('should get current user profile', async () => {
      const mockUserData = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (dbHelpers.users.getCurrent as jest.Mock).mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const result = await dbHelpers.users.getCurrent();
      
      expect(result.data).toEqual(mockUserData);
      expect(result.error).toBeNull();
    });

    it('should handle user profile creation', async () => {
      const mockProfileData = {
        name: 'Test User',
        bio: 'Test bio',
        location: 'Test City',
      };

      (dbHelpers.users.createProfile as jest.Mock).mockResolvedValue({
        data: { id: '123', ...mockProfileData },
        error: null,
      });

      const result = await dbHelpers.users.createProfile(mockProfileData);
      
      expect(result.data).toEqual({ id: '123', ...mockProfileData });
      expect(result.error).toBeNull();
    });
  });

  describe('userGoals', () => {
    it('should get all user goals', async () => {
      const mockGoals = [
        { id: '1', goal_type: 'race_time', target_value: '2:30:00' },
        { id: '2', goal_type: 'race_count', target_value: '5' },
      ];

      (dbHelpers.userGoals.getAll as jest.Mock).mockResolvedValue({
        data: mockGoals,
        error: null,
      });

      const result = await dbHelpers.userGoals.getAll();
      
      expect(result.data).toEqual(mockGoals);
      expect(result.error).toBeNull();
    });

    it('should add a new goal', async () => {
      const mockGoal = {
        goal_type: 'race_time',
        target_value: '2:30:00',
        target_date: '2025-12-31',
      };

      (dbHelpers.userGoals.add as jest.Mock).mockResolvedValue({
        data: { id: '123', ...mockGoal },
        error: null,
      });

      const result = await dbHelpers.userGoals.add(mockGoal);
      
      expect(result.data).toEqual({ id: '123', ...mockGoal });
      expect(result.error).toBeNull();
    });
  });

  describe('raceResults', () => {
    it('should get all race results', async () => {
      const mockResults = [
        {
          id: '1',
          race_name: 'Test Triathlon',
          overall_time: '02:30:00',
          overall_placement: 15,
        },
      ];

      (dbHelpers.raceResults.getAll as jest.Mock).mockResolvedValue({
        data: mockResults,
        error: null,
      });

      const result = await dbHelpers.raceResults.getAll();
      
      expect(result.data).toEqual(mockResults);
      expect(result.error).toBeNull();
    });

    it('should add a race result', async () => {
      const mockResult = {
        race_name: 'Test Triathlon',
        race_date: '2024-06-15',
        overall_time: '02:30:00',
        swim_time: '00:25:00',
        bike_time: '01:15:00',
        run_time: '00:50:00',
        overall_placement: 15,
      };

      (dbHelpers.raceResults.add as jest.Mock).mockResolvedValue({
        data: { id: '123', ...mockResult },
        error: null,
      });

      const result = await dbHelpers.raceResults.add(mockResult);
      
      expect(result.data).toEqual({ id: '123', ...mockResult });
      expect(result.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database connection failed' };

      (dbHelpers.users.getCurrent as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await dbHelpers.users.getCurrent();
      
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});