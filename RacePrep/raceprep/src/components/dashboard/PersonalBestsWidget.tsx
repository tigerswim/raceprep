import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TbTrophy, TbFlame, TbClock, TbCalendar, TbChartBar } from 'react-icons/tb';

interface PersonalBest {
  distance_type: string;
  overall_time: string;
  race_name: string;
  race_date: string;
  swim_time?: string;
  bike_time?: string;
  run_time?: string;
  t1_time?: string;
  t2_time?: string;
  overall_placement?: number;
  age_group_placement?: number;
}

interface PersonalBests {
  sprint?: PersonalBest;
  olympic?: PersonalBest;
  '70.3'?: PersonalBest;
  ironman?: PersonalBest;
}

export const PersonalBestsWidget: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [personalBests, setPersonalBests] = useState<PersonalBests>({});
  const [recentPRs, setRecentPRs] = useState<PersonalBest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalBests();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const timeToSeconds = (timeStr: string | null | undefined): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return 0;
  };

  const loadPersonalBests = async () => {
    try {
      setIsLoading(true);

      // Get all user race results
      const { data: results, error } = await dbHelpers.userRaceResults.getAll();

      if (error || !results || results.length === 0) {
        setPersonalBests({});
        setRecentPRs([]);
        return;
      }

      // Group results by distance type and find best times
      const bestsByDistance: PersonalBests = {};
      const distanceTypes = ['sprint', 'olympic', '70.3', 'ironman'];

      distanceTypes.forEach(distanceType => {
        const distanceResults = results.filter(
          r => r.race?.distance_type === distanceType && r.overall_time
        );

        if (distanceResults.length > 0) {
          // Sort by overall time (ascending) to find fastest
          const sorted = distanceResults.sort((a, b) => {
            const timeA = timeToSeconds(a.overall_time);
            const timeB = timeToSeconds(b.overall_time);
            return timeA - timeB;
          });

          const best = sorted[0];
          bestsByDistance[distanceType as keyof PersonalBests] = {
            distance_type: distanceType,
            overall_time: best.overall_time!,
            race_name: best.race?.name || 'Unknown Race',
            race_date: best.race?.date || 'Unknown Date',
            swim_time: best.swim_time,
            bike_time: best.bike_time,
            run_time: best.run_time,
            t1_time: best.t1_time,
            t2_time: best.t2_time,
            overall_placement: best.overall_placement,
            age_group_placement: best.age_group_placement
          };
        }
      });

      setPersonalBests(bestsByDistance);

      // Find recent PRs (races from last 90 days that are personal bests)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const recent = results
        .filter(r => {
          const raceDate = new Date(r.race?.date || '');
          return raceDate >= ninetyDaysAgo && r.overall_time;
        })
        .filter(r => {
          const distanceType = r.race?.distance_type;
          const best = distanceType ? bestsByDistance[distanceType as keyof PersonalBests] : null;
          return best && best.overall_time === r.overall_time;
        })
        .map(r => ({
          distance_type: r.race?.distance_type || 'unknown',
          overall_time: r.overall_time!,
          race_name: r.race?.name || 'Unknown Race',
          race_date: r.race?.date || 'Unknown Date',
          swim_time: r.swim_time,
          bike_time: r.bike_time,
          run_time: r.run_time,
          overall_placement: r.overall_placement,
          age_group_placement: r.age_group_placement
        }))
        .slice(0, 3);

      setRecentPRs(recent);
    } catch (error) {
      console.error('Error loading personal bests:', error);
      setPersonalBests({});
      setRecentPRs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDistanceIcon = (distanceType: string): string => {
    switch (distanceType) {
      case 'sprint':
        return '⚡';
      case 'olympic':
        return '🥇';
      case '70.3':
        return '💪';
      case 'ironman':
        return '🏆';
      default:
        return '🎯';
    }
  };

  const getDistanceLabel = (distanceType: string): string => {
    switch (distanceType) {
      case 'sprint':
        return 'Sprint';
      case 'olympic':
        return 'Olympic';
      case '70.3':
        return '70.3';
      case 'ironman':
        return 'Ironman';
      default:
        return distanceType;
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string): string => {
    return timeStr;
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <TbTrophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Personal Bests</h3>
            <p className="text-sm text-white/60">Loading your records...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  const pbCount = Object.keys(personalBests).length;

  if (pbCount === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <TbTrophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Personal Bests</h3>
            <p className="text-sm text-white/60">Track your fastest times</p>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-white/50 mb-4">No personal records yet</p>
          <button
            onClick={() => router.push('/(tabs)/races')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Add Race Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <TbTrophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Personal Bests</h3>
            <p className="text-sm text-white/60">{pbCount} distance {pbCount === 1 ? 'record' : 'records'}</p>
          </div>
        </div>
        {recentPRs.length > 0 && (
          <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-xs font-semibold">
            <TbFlame className="w-3 h-3" />
            {recentPRs.length} recent PR{recentPRs.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Personal Bests by Distance */}
      <div className="space-y-3 mb-6">
        {Object.entries(personalBests).map(([distanceType, pb]) => (
          <div
            key={distanceType}
            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-xl p-4 hover:border-yellow-400/40 transition-all cursor-pointer"
            onClick={() => router.push('/(tabs)/races')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getDistanceIcon(distanceType)}</span>
                <div>
                  <div className="text-white font-semibold">{getDistanceLabel(distanceType)}</div>
                  <div className="text-white/60 text-xs">{pb.race_name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-yellow-300 font-mono">{formatTime(pb.overall_time)}</div>
                <div className="text-white/60 text-xs flex items-center justify-end gap-1">
                  <TbCalendar className="w-3 h-3" />
                  {formatDate(pb.race_date)}
                </div>
              </div>
            </div>

            {/* Split Times Preview */}
            {(pb.swim_time || pb.bike_time || pb.run_time) && (
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                {pb.swim_time && (
                  <div className="text-center">
                    <div className="text-blue-300 text-xs">🏊‍♂️ Swim</div>
                    <div className="text-white text-xs font-mono">{formatTime(pb.swim_time)}</div>
                  </div>
                )}
                {pb.bike_time && (
                  <div className="text-center">
                    <div className="text-orange-300 text-xs">🚴‍♂️ Bike</div>
                    <div className="text-white text-xs font-mono">{formatTime(pb.bike_time)}</div>
                  </div>
                )}
                {pb.run_time && (
                  <div className="text-center">
                    <div className="text-green-300 text-xs">🏃‍♂️ Run</div>
                    <div className="text-white text-xs font-mono">{formatTime(pb.run_time)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Placements */}
            {(pb.overall_placement || pb.age_group_placement) && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                {pb.overall_placement && (
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <TbChartBar className="w-3 h-3" />
                    Overall: #{pb.overall_placement}
                  </div>
                )}
                {pb.age_group_placement && (
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <TbTrophy className="w-3 h-3" />
                    AG: #{pb.age_group_placement}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TbFlame className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-semibold text-green-300">Recent Personal Records</h4>
          </div>
          <div className="space-y-2">
            {recentPRs.map((pr, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{getDistanceIcon(pr.distance_type)}</span>
                  <span className="text-white/90">{getDistanceLabel(pr.distance_type)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-300 font-mono font-semibold">{formatTime(pr.overall_time)}</span>
                  <span className="text-white/50 text-xs">{formatDate(pr.race_date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation Section */}
      <div className="bg-white/5 rounded-xl p-3">
        <div className="text-center">
          <p className="text-white/70 text-sm">
            {pbCount < 4 ? (
              <>🎯 Complete more distances to build your trophy case!</>
            ) : (
              <>🏆 All distances conquered! Time to beat your records!</>
            )}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 mt-4">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{pbCount} personal best{pbCount !== 1 ? 's' : ''}</span>
          <button
            onClick={() => router.push('/(tabs)/races')}
            className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
          >
            View All Results →
          </button>
        </div>
      </div>
    </div>
  );
};
