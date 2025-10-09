import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RaceAnalysisModal } from './RaceAnalysisModal';
import { RaceComparisonModal } from './RaceComparisonModal';
import { RacePredictionModal } from './RacePredictionModal';
import { AddResultModal } from './AddResultModal';
import { PerformanceOverviewWidget } from './dashboard/PerformanceOverviewWidget';
import { UpcomingRacesWidget } from './dashboard/UpcomingRacesWidget';
import { GoalsProgressWidget } from './dashboard/GoalsProgressWidget';
import { WeatherWidget } from './dashboard/WeatherWidget';
// import { TrainingPlanProgressWidget } from './dashboard/TrainingPlanProgressWidget'; // Disabled - uses React Native components
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
    console.log('[DASHBOARD] Starting to load dashboard data...');

    if (!user) {
      console.log('[DASHBOARD] No user, skipping data load');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Add timeout protection for dashboard loading
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[DASHBOARD] Loading timeout - continuing with minimal data');
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
        console.error('[DASHBOARD] Loading failed:', error);
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
      console.log('[DASHBOARD] Loading dashboard data...');
      // Don't set loading to true here if it's already handled by useEffect
      if (!isLoading) {
        setIsLoading(true);
      }

      // Load saved races (user_planned_races) with timeout protection
      let savedRaces: Course[] = [];

      if (user) {
        try {
          console.log('[DASHBOARD] Loading user planned races...');

          // Add individual timeout for this specific query
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('User planned races query timeout')), 3000);
          });

          const dataPromise = dbHelpers.userPlannedRaces.getAll();
          const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

          if (error) {
            console.warn('[DASHBOARD] Database error loading planned races:', error);
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
            console.log('[DASHBOARD] Successfully loaded planned races:', data.length);
            savedRaces = data.map((race: any) => ({
              id: race.id,
              name: race.external_races?.name || race.race_name || 'Unknown Race',
              location: race.external_races?.location || 'Unknown Location',
              distance_type: race.external_races?.distance_type || 'unknown',
              difficulty_score: race.external_races?.difficulty_score
            }));
          }
        } catch (dbError: any) {
          console.warn('[DASHBOARD] Error or timeout loading saved races:', dbError.message);
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

      console.log('[DASHBOARD] Loading races and race results...');

      // Load race results with timeout protection
      const raceResultsTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Race results query timeout')), 3000);
      });

      // Only load race results since we don't need all races for dashboard
      const raceResultsResult = user
        ? await Promise.race([dbHelpers.raceResults.getUserResults(user.id), raceResultsTimeoutPromise]).catch(() => ({ data: [], error: 'timeout' }))
        : { data: [], error: null };

      if (raceResultsResult.error) {
        console.warn('[DASHBOARD] Error loading race results:', raceResultsResult.error);
      }

      console.log('[DASHBOARD] Setting dashboard data...');

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
      console.error('[DASHBOARD] Error in loadDashboardData:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while loading dashboard';
      setError(errorMessage);
    } finally {
      console.log('[DASHBOARD] Finished loading dashboard data');
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
        console.error('Error adding race result:', error);
        alert('Failed to save race result. Please try again.');
        return;
      }

      alert('Race result added successfully!');
      setShowAddResultModal(false);
      
      // Reload dashboard data to show updated information
      loadDashboardData();
    } catch (error) {
      console.error('Error adding race result:', error);
      alert('Failed to save race result. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Unable to load dashboard</div>
          <div className="text-white/70 text-center mb-4">{error}</div>
          <button 
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 relative overflow-auto" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-orange-900/20"></div>
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 overflow-y-auto">
        <div className="p-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">RacePrep</h1>
                <p className="text-sm text-blue-300">Performance Analytics Platform</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/(tabs)/profile')}
              className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>

          {/* Enhanced Dashboard Widgets - Temporarily disabled for debugging */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PerformanceOverviewWidget />
            <UpcomingRacesWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GoalsProgressWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WeatherWidget />
          </div> */}

          {/* Race Analysis Section */}
          {userRaceResults.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Latest Race Performance</h2>
                  <p className="text-white/60">
                    {performanceStats.latestRace?.race_name} • {formatDate(performanceStats.latestRace?.race_date)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (userRaceResults.length > 0) {
                      setSelectedResult(userRaceResults[0]);
                      setShowAnalysisModal(true);
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                >
                  Analyze Race
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-white font-mono mb-1">
                    {performanceStats.latestRace?.overall_time || 'N/A'}
                  </p>
                  <p className="text-xs text-white/60">Overall Time</p>
                </div>
                {performanceStats.latestRace?.overall_rank && (
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-white font-mono mb-1">
                      #{performanceStats.latestRace.overall_rank}
                    </p>
                    <p className="text-xs text-white/60">Overall Place</p>
                  </div>
                )}
                {performanceStats.latestRace?.age_group_rank && (
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-white font-mono mb-1">
                      #{performanceStats.latestRace.age_group_rank}
                    </p>
                    <p className="text-xs text-white/60">Age Group</p>
                  </div>
                )}
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-white font-mono mb-1">
                    {performanceStats.latestRace?.distance_type?.charAt(0).toUpperCase()}{performanceStats.latestRace?.distance_type?.slice(1) || 'Race'}
                  </p>
                  <p className="text-xs text-white/60">Distance</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowAddResultModal(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-lg font-bold mb-1 flex items-center justify-center gap-2"><TbClock className="w-5 h-5" /> Add Race Result</div>
                <div className="text-sm opacity-90">Log your race times</div>
              </button>
              <button
                onClick={() => {
                  if (userRaceResults.length >= 2) {
                    // Pre-select the first two races for comparison
                    const raceIds = userRaceResults.slice(0, 2).map(result => result.race_id || result.id);
                    setComparingRaces(raceIds);
                    setShowComparisonModal(true);
                  }
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-center"
                disabled={userRaceResults.length < 2}
              >
                <div className="text-lg font-bold mb-1 flex items-center justify-center gap-2"><TbVs className="w-5 h-5" /> Compare Races</div>
                <div className="text-sm opacity-90">
                  {userRaceResults.length < 2 ? 'Need 2+ races' : 'Compare your performances'}
                </div>
              </button>
              <button
                onClick={() => {
                  if (courses.length > 0) {
                    setSelectedCourse(courses[0]);
                    setShowPredictionModal(true);
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-center"
                disabled={courses.length === 0}
              >
                <div className="text-lg font-bold mb-1 flex items-center justify-center gap-2"><TbCrystalBall className="w-5 h-5" /> Race Prediction</div>
                <div className="text-sm opacity-90">
                  {courses.length === 0 ? 'No courses available' : 'Predict your race time'}
                </div>
              </button>
              <button
                onClick={() => {
                  router.push('/(tabs)/training');
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-lg font-bold mb-1 flex items-center justify-center gap-2"><TbRun className="w-5 h-5" /> Training</div>
                <div className="text-sm opacity-90">Log workouts & track progress</div>
              </button>
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