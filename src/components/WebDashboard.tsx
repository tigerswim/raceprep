import { logger } from '../utils/logger';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RaceAnalysisModal } from './RaceAnalysisModal';
import { RaceComparisonModal } from './RaceComparisonModal';
import { RacePredictionModal } from './RacePredictionModal';
import { AddResultModal } from './AddResultModal';
import { PerformanceOverviewWidget } from './dashboard/PerformanceOverviewWidget';
import { UpcomingRacesWidget } from './dashboard/UpcomingRacesWidget';
import { WeatherWidget } from './dashboard/WeatherWidget';
import { TrainingPlanProgressWidget } from './dashboard/TrainingPlanProgressWidget';
import {
  TbClock,
  TbVs,
  TbCrystalBall,
  TbRun
} from 'react-icons/tb';

interface Course {
  id: string;
  name: string;
  location: string;
  distance_type: string;
  difficulty_score?: number;
}

interface Race {
  id: string;
  name: string;
}

interface UserRaceResult {
  id: string;
  race_name: string;
  race_date: string;
  race_location: string;
  distance_type: string;
  overall_time: string;
  swim_time?: string;
  t1_time?: string;
  bike_time?: string;
  t2_time?: string;
  run_time?: string;
  overall_rank?: number;
  age_group_rank?: number;
}

interface PerformanceStats {
  totalRaces: number;
  seasonProgress: number;
  personalBest?: UserRaceResult;
  averageImprovement: string;
  transitionEfficiency: number;
  latestRace?: UserRaceResult;
}

export const WebDashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [userRaceResults, setUserRaceResults] = useState<UserRaceResult[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    totalRaces: 0,
    seasonProgress: 0,
    averageImprovement: '0:00',
    transitionEfficiency: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add caching for dashboard data
  const [dashboardCache, setDashboardCache] = useState<{
    courses?: { data: Course[], timestamp: number },
    races?: { data: Race[], timestamp: number },
    results?: { data: UserRaceResult[], timestamp: number }
  }>({});
  const DASHBOARD_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Modal states
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [comparingRaces, setComparingRaces] = useState<string[]>([]);

  useEffect(() => {
    logger.debug('[DASHBOARD] Starting to load dashboard data...');

    if (!user) {
      logger.debug('[DASHBOARD] No user, skipping data load');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Add timeout protection for dashboard loading
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        logger.warn('[DASHBOARD] Loading timeout - continuing with minimal data');
        setIsLoading(false);
        setError('Dashboard loading timeout - some features may be limited');
      }
    }, 8000);

    const loadData = async () => {
      try {
        await loadDashboardData();
        if (isMounted) {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        logger.error('[DASHBOARD] Loading failed:', error);
        if (isMounted) {
          setError('Failed to load dashboard data');
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      logger.debug('[DASHBOARD] Loading dashboard data...');
      // Don't set loading to true here if it's already handled by useEffect
      if (!isLoading) {
        setIsLoading(true);
      }

      // Load saved races (user_planned_races) with timeout protection
      let savedRaces: Course[] = [];

      if (user) {
        try {
          logger.debug('[DASHBOARD] Loading user planned races...');

          // Add individual timeout for this specific query
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('User planned races query timeout')), 3000);
          });

          const dataPromise = dbHelpers.userPlannedRaces.getAll();
          const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

          if (error) {
            logger.warn('[DASHBOARD] Database error loading planned races:', error);
            // Use fallback data
            savedRaces = [
              {
                id: 'saved-1',
                name: 'Ironman Louisville',
                location: 'Louisville, KY',
                distance_type: 'ironman',
                difficulty_score: 9
              },
              {
                id: 'saved-2',
                name: 'Nashville Sprint Triathlon',
                location: 'Nashville, TN',
                distance_type: 'sprint',
                difficulty_score: 6
              }
            ];
          } else if (data) {
            logger.debug('[DASHBOARD] Successfully loaded planned races:', data.length);
            savedRaces = data.map((race: any) => ({
              id: race.id,
              name: race.external_races?.name || race.race_name || 'Unknown Race',
              location: race.external_races?.location || 'Unknown Location',
              distance_type: race.external_races?.distance_type || 'unknown',
              difficulty_score: race.external_races?.difficulty_score
            }));
          }
        } catch (dbError: any) {
          logger.warn('[DASHBOARD] Error or timeout loading saved races:', dbError.message);
          // Use fallback data
          savedRaces = [
            {
              id: 'saved-1',
              name: 'Ironman Louisville',
              location: 'Louisville, KY',
              distance_type: 'ironman',
              difficulty_score: 9
            },
            {
              id: 'saved-2',
              name: 'Nashville Sprint Triathlon',
              location: 'Nashville, TN',
              distance_type: 'sprint',
              difficulty_score: 6
            }
          ];
        }
      }

      logger.debug('[DASHBOARD] Loading races and race results...');

      // Load race results with timeout protection
      const raceResultsTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Race results query timeout')), 3000);
      });

      // Only load race results since we don't need all races for dashboard
      const raceResultsResult = user
        ? await Promise.race([dbHelpers.raceResults.getUserResults(user.id), raceResultsTimeoutPromise]).catch(() => ({ data: [], error: 'timeout' }))
        : { data: [], error: null };

      if (raceResultsResult.error) {
        logger.warn('[DASHBOARD] Error loading race results:', raceResultsResult.error);
      }

      logger.debug('[DASHBOARD] Setting dashboard data...');

      // Set courses to saved races instead of generic courses
      setCourses(savedRaces);
      setRaces([]); // We don't need general races for dashboard

      // Process user race results
      const raceResults = raceResultsResult.data || [];
      setUserRaceResults(raceResults);

      // Calculate performance statistics
      const stats = calculatePerformanceStats(raceResults);
      setPerformanceStats(stats);

      setError(null);
    } catch (err) {
      logger.error('[DASHBOARD] Error in loadDashboardData:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while loading dashboard';
      setError(errorMessage);
    } finally {
      logger.debug('[DASHBOARD] Finished loading dashboard data');
      setIsLoading(false);
    }
  };

  const calculatePerformanceStats = (raceResults: any[]): PerformanceStats => {
    if (!raceResults.length) {
      return {
        totalRaces: 0,
        seasonProgress: 0,
        averageImprovement: '0:00',
        transitionEfficiency: 0
      };
    }

    // Convert race results to our interface format
    const results: UserRaceResult[] = raceResults.map((result: any) => ({
      id: result.id,
      race_name: result.user_races?.name || 'Unknown Race',
      race_date: result.user_races?.date || result.race_date || '',
      race_location: result.user_races?.location || '',
      distance_type: result.user_races?.distance_type || result.distance_type || 'sprint',
      overall_time: result.overall_time || '0:00:00',
      swim_time: result.swim_time,
      t1_time: result.t1_time,
      bike_time: result.bike_time,
      t2_time: result.t2_time,
      run_time: result.run_time,
      overall_rank: result.overall_rank,
      age_group_rank: result.age_group_rank
    }));

    // Sort by date (most recent first)
    results.sort((a, b) => new Date(b.race_date).getTime() - new Date(a.race_date).getTime());

    // Find personal best (fastest overall time for same distance)
    const personalBest = results.reduce((best, current) => {
      if (!best) return current;
      if (current.distance_type === best.distance_type) {
        const currentTime = parseTimeString(current.overall_time);
        const bestTime = parseTimeString(best.overall_time);
        return currentTime < bestTime ? current : best;
      }
      return best;
    }, undefined as UserRaceResult | undefined);

    // Calculate season progress (assuming 12 races per season)
    const currentYear = new Date().getFullYear();
    const thisYearRaces = results.filter(r => new Date(r.race_date).getFullYear() === currentYear);
    const seasonProgress = Math.min(100, (thisYearRaces.length / 12) * 100);

    // Calculate average improvement (comparing last 3 races to previous 3)
    let averageImprovement = '0:00';
    if (results.length >= 6) {
      const recentRaces = results.slice(0, 3);
      const olderRaces = results.slice(3, 6);

      const recentAvg = recentRaces.reduce((sum, race) => sum + parseTimeString(race.overall_time), 0) / 3;
      const olderAvg = olderRaces.reduce((sum, race) => sum + parseTimeString(race.overall_time), 0) / 3;

      const improvementSeconds = olderAvg - recentAvg;
      averageImprovement = formatTime(Math.abs(improvementSeconds), true);
    }

    // Calculate transition efficiency (average of T1 and T2 times)
    const transitionTimes = results
      .filter(r => r.t1_time && r.t2_time)
      .map(r => parseTimeString(r.t1_time!) + parseTimeString(r.t2_time!));

    const avgTransitionTime = transitionTimes.length > 0
      ? transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length
      : 0;

    // Convert to efficiency score (lower time = higher efficiency)
    // Assume good transition time is around 3 minutes total
    const transitionEfficiency = Math.max(0, Math.min(100,
      100 - ((avgTransitionTime - 180) / 120) * 100
    ));

    return {
      totalRaces: results.length,
      seasonProgress: Math.round(seasonProgress),
      personalBest,
      averageImprovement,
      transitionEfficiency: Math.round(transitionEfficiency),
      latestRace: results[0]
    };
  };

  const parseTimeString = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // H:M:S
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // M:S
    }
    return 0;
  };

  const formatTime = (seconds: number, showSign = false): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const sign = showSign && seconds > 0 ? '-' : '';

    if (hours > 0) {
      return `${sign}${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${sign}${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Race result handler
  const handleAddRaceResult = async (resultData: any) => {
    if (!user) {
      alert('Please sign in to add race results');
      return;
    }

    try {
      // Add user_id to the result data
      const raceResultWithUser = {
        ...resultData,
        user_id: user.id
      };

      const { data, error } = await dbHelpers.raceResults.add(raceResultWithUser);

      if (error) {
        logger.error('Error adding race result:', error);
        alert('Failed to save race result. Please try again.');
        return;
      }

      alert('Race result added successfully!');
      setShowAddResultModal(false);

      // Reload dashboard data to show updated information
      loadDashboardData();
    } catch (error) {
      logger.error('Error adding race result:', error);
      alert('Failed to save race result. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-text-primary text-lg font-mono tracking-wider uppercase">
          LOADING...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-text-primary text-lg mb-4 font-mono tracking-wider uppercase">
            UNABLE TO LOAD DASHBOARD
          </div>
          <div className="text-text-secondary text-center mb-4 font-mono tracking-wide">
            {error}
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-colors font-mono tracking-wider uppercase"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-terminal-bg relative overflow-auto" style={{ minHeight: '100dvh' }}>
      <div className="relative z-10 overflow-y-auto">
        <div className="p-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b-2 border-terminal-border pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-terminal-panel border-2 border-accent-yellow flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary font-mono tracking-wider">RACEPREP</h1>
                <p className="text-xs text-text-secondary font-mono uppercase tracking-wide">PERFORMANCE ANALYTICS PLATFORM</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/(tabs)/profile')}
              className="w-10 h-10 bg-terminal-panel border-2 border-terminal-border flex items-center justify-center hover:border-accent-yellow transition-colors"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>

          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceOverviewWidget />
            <UpcomingRacesWidget />
            <TrainingPlanProgressWidget />
            <WeatherWidget />

            {/* Latest Race Performance */}
            {userRaceResults.length > 0 && (
              <div className="bg-terminal-panel border-2 border-terminal-border p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary font-mono tracking-wider">
                      LATEST RACE PERFORMANCE
                    </h3>
                    <p className="text-xs text-text-secondary font-mono mt-1">
                      {performanceStats.latestRace?.race_name?.toUpperCase()} • {formatDate(performanceStats.latestRace?.race_date).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (userRaceResults.length > 0) {
                        setSelectedResult(userRaceResults[0]);
                        setShowAnalysisModal(true);
                      }
                    }}
                    className="bg-accent-yellow text-terminal-bg px-4 py-3 font-mono text-xs font-bold tracking-wider hover:bg-accent-yellow/90 transition-colors"
                  >
                    ANALYZE →
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-terminal-bg border border-terminal-border p-4 text-center">
                    <p className="text-2xl font-bold text-text-primary font-mono mb-2">
                      {performanceStats.latestRace?.overall_time || 'N/A'}
                    </p>
                    <p className="text-xs text-text-secondary font-mono">OVERALL TIME</p>
                  </div>
                  {performanceStats.latestRace?.overall_rank && (
                    <div className="bg-terminal-bg border border-terminal-border p-4 text-center">
                      <p className="text-2xl font-bold text-text-primary font-mono mb-2">
                        #{performanceStats.latestRace.overall_rank}
                      </p>
                      <p className="text-xs text-text-secondary font-mono">OVERALL PLACE</p>
                    </div>
                  )}
                  {performanceStats.latestRace?.age_group_rank && (
                    <div className="bg-terminal-bg border border-terminal-border p-4 text-center">
                      <p className="text-2xl font-bold text-text-primary font-mono mb-2">
                        #{performanceStats.latestRace.age_group_rank}
                      </p>
                      <p className="text-xs text-text-secondary font-mono">AGE GROUP</p>
                    </div>
                  )}
                  <div className="bg-terminal-bg border border-terminal-border p-4 text-center">
                    <p className="text-2xl font-bold text-text-primary font-mono mb-2">
                      {performanceStats.latestRace?.distance_type?.charAt(0).toUpperCase()}{performanceStats.latestRace?.distance_type?.slice(1) || 'RACE'}
                    </p>
                    <p className="text-xs text-text-secondary font-mono">DISTANCE</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-terminal-panel border-2 border-terminal-border p-6">
              <h2 className="text-lg font-bold text-text-primary font-mono tracking-wider mb-4">QUICK ACTIONS</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Add Race Result */}
                <button
                  onClick={() => setShowAddResultModal(true)}
                  className="bg-[#22c55e] text-terminal-bg px-4 py-4 font-mono text-xs font-bold tracking-wider hover:opacity-90 transition-opacity text-center"
                >
                  <div className="mb-2">[+] ADD RESULT</div>
                  <div className="text-[9px] opacity-80">LOG RACE TIMES</div>
                </button>

                {/* Compare Races */}
                <button
                  onClick={() => {
                    if (userRaceResults.length >= 2) {
                      const raceIds = userRaceResults.slice(0, 2).map(result => result.race_id || result.id);
                      setComparingRaces(raceIds);
                      setShowComparisonModal(true);
                    }
                  }}
                  disabled={userRaceResults.length < 2}
                  className={`${
                    userRaceResults.length < 2 ? 'bg-terminal-border opacity-50 cursor-not-allowed' : 'bg-[#a855f7] hover:opacity-90'
                  } text-terminal-bg px-4 py-4 font-mono text-xs font-bold tracking-wider transition-opacity text-center`}
                >
                  <div className="mb-2">[VS] COMPARE</div>
                  <div className="text-[9px] opacity-80">
                    {userRaceResults.length < 2 ? 'NEED 2+ RACES' : 'RACE COMPARISON'}
                  </div>
                </button>

                {/* Race Prediction */}
                <button
                  onClick={() => {
                    if (courses.length > 0) {
                      setSelectedCourse(courses[0]);
                      setShowPredictionModal(true);
                    }
                  }}
                  disabled={courses.length === 0}
                  className={`${
                    courses.length === 0 ? 'bg-terminal-border opacity-50 cursor-not-allowed' : 'bg-[#14b8a6] hover:opacity-90'
                  } text-terminal-bg px-4 py-4 font-mono text-xs font-bold tracking-wider transition-opacity text-center`}
                >
                  <div className="mb-2">[?] PREDICT</div>
                  <div className="text-[9px] opacity-80">
                    {courses.length === 0 ? 'NO COURSES' : 'PREDICT TIME'}
                  </div>
                </button>

                {/* Training */}
                <button
                  onClick={() => router.push('/(tabs)/training')}
                  className="bg-accent-yellow text-terminal-bg px-4 py-4 font-mono text-xs font-bold tracking-wider hover:opacity-90 transition-opacity text-center"
                >
                  <div className="mb-2">[&gt;] TRAINING</div>
                  <div className="text-[9px] opacity-80">LOG WORKOUTS</div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {showAnalysisModal && selectedResult && (
        <RaceAnalysisModal
          onClose={() => setShowAnalysisModal(false)}
          result={selectedResult}
          races={races}
        />
      )}

      {showComparisonModal && (
        <RaceComparisonModal
          onClose={() => setShowComparisonModal(false)}
          races={races}
          raceResults={userRaceResults}
          comparingRaces={comparingRaces}
          setComparingRaces={setComparingRaces}
        />
      )}

      {showPredictionModal && selectedCourse && (
        <RacePredictionModal
          course={selectedCourse}
          onClose={() => setShowPredictionModal(false)}
        />
      )}

      {showAddResultModal && (
        <AddResultModal
          onClose={() => setShowAddResultModal(false)}
          onSubmit={handleAddRaceResult}
          races={courses}
        />
      )}
    </div>
  );
};
