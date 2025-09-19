import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';

interface UpcomingRace {
  id: string;
  name: string;
  date: string;
  location: string;
  distance_type: string;
  status: 'interested' | 'registered' | 'training' | 'completed';
  daysUntil: number;
  registration_url?: string;
  preparationStatus: 'excellent' | 'good' | 'needs-attention' | 'unknown';
}

export const UpcomingRacesWidget: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [upcomingRaces, setUpcomingRaces] = useState<UpcomingRace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUpcomingRaces();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUpcomingRaces = async () => {
    try {
      setIsLoading(true);

      const { data: plannedRaces, error } = await dbHelpers.userPlannedRaces.getAll();

      if (error) {
        console.warn('Error loading planned races from database:', error);

        // Try localStorage fallback
        try {
          const localRacesKey = `saved_races_${user.id}`;
          const localRaces = localStorage.getItem(localRacesKey);

          if (localRaces) {
            const parsedRaces = JSON.parse(localRaces);
            console.log('UpcomingRacesWidget loaded from localStorage:', parsedRaces.length, 'races');

            // Transform localStorage data to match expected format
            const transformedLocalRaces = parsedRaces.map((race: any) => ({
              id: race.id,
              external_races: {
                name: race.name,
                date: race.date,
                location: race.location,
                distance_type: race.distance_type
              },
              status: race.status || 'interested'
            }));

            // Process the local races same as database races
            const processedLocalRaces = transformedLocalRaces
              .filter((race: any) => {
                const raceDate = new Date(race.external_races?.date || '');
                return raceDate > new Date();
              })
              .map((race: any) => {
                const raceDate = new Date(race.external_races?.date || '');
                const daysUntil = Math.ceil((raceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return {
                  id: race.id,
                  name: race.external_races?.name || 'Unknown Race',
                  date: race.external_races?.date || '',
                  location: race.external_races?.location || 'Unknown Location',
                  distance_type: race.external_races?.distance_type || 'unknown',
                  status: race.status || 'interested',
                  daysUntil,
                  registration_url: null,
                  preparationStatus: calculatePreparationStatus(daysUntil, race.status)
                } as UpcomingRace;
              })
              .sort((a, b) => a.daysUntil - b.daysUntil)
              .slice(0, 3);

            setUpcomingRaces(processedLocalRaces);
            return;
          }
        } catch (localError) {
          console.warn('Error loading from localStorage:', localError);
        }

        // Show sample data for demo as final fallback
        setUpcomingRaces(getSampleUpcomingRaces());
        return;
      }

      if (!plannedRaces || plannedRaces.length === 0) {
        setUpcomingRaces([]);
        return;
      }

      // Process and filter upcoming races
      const now = new Date();
      const processedRaces = plannedRaces
        .filter(race => {
          // Only show races that haven't happened yet
          const raceDate = new Date(race.external_races?.date || race.race_date || '');
          return raceDate > now;
        })
        .map(race => {
          const raceDate = new Date(race.external_races?.date || race.race_date || '');
          const daysUntil = Math.ceil((raceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: race.id,
            name: race.external_races?.name || race.race_name || 'Unknown Race',
            date: race.external_races?.date || race.race_date || '',
            location: race.external_races?.location || 'Unknown Location',
            distance_type: race.external_races?.distance_type || 'unknown',
            status: race.status || 'interested',
            daysUntil,
            registration_url: race.external_races?.registration_url,
            preparationStatus: calculatePreparationStatus(daysUntil, race.status)
          } as UpcomingRace;
        })
        .sort((a, b) => a.daysUntil - b.daysUntil) // Sort by closest race first
        .slice(0, 3); // Show only next 3 races

      setUpcomingRaces(processedRaces);
    } catch (error) {
      console.error('Error loading upcoming races:', error);
      setUpcomingRaces(getSampleUpcomingRaces());
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleUpcomingRaces = (): UpcomingRace[] => {
    const now = new Date();
    return [
      {
        id: 'sample-1',
        name: 'Ironman Louisville',
        date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
        location: 'Louisville, KY',
        distance_type: 'ironman',
        status: 'registered',
        daysUntil: 45,
        preparationStatus: 'good'
      },
      {
        id: 'sample-2',
        name: 'Nashville Sprint Triathlon',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
        location: 'Nashville, TN',
        distance_type: 'sprint',
        status: 'training',
        daysUntil: 21,
        preparationStatus: 'excellent'
      }
    ];
  };

  const calculatePreparationStatus = (daysUntil: number, status: string): 'excellent' | 'good' | 'needs-attention' | 'unknown' => {
    if (status === 'completed') return 'excellent';

    if (daysUntil > 60) return 'good';
    if (daysUntil > 30 && status === 'training') return 'excellent';
    if (daysUntil > 30) return 'good';
    if (daysUntil > 14 && status === 'training') return 'good';
    if (daysUntil > 14) return 'needs-attention';
    if (status === 'training') return 'good';
    return 'needs-attention';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'training':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'interested':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      default:
        return 'bg-white/20 text-white/70 border-white/30';
    }
  };

  const getPreparationColor = (status: 'excellent' | 'good' | 'needs-attention' | 'unknown') => {
    switch (status) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'needs-attention':
        return 'text-orange-400';
      default:
        return 'text-white/50';
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getDistanceTypeDisplay = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'sprint':
        return 'Sprint';
      case 'olympic':
        return 'Olympic';
      case '70.3':
        return '70.3';
      case 'ironman':
        return 'Ironman';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Upcoming Races</h3>
            <p className="text-sm text-white/60">Loading race schedule...</p>
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

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Upcoming Races</h3>
            <p className="text-sm text-white/60">Next events in your calendar</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/(tabs)/races')}
          className="text-orange-400 hover:text-orange-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {upcomingRaces.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white/50 mb-4">No upcoming races scheduled</p>
          <button
            onClick={() => router.push('/(tabs)/races')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Discover Races
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingRaces.map((race) => (
            <div key={race.id} className="border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{race.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-white/70 mb-2">
                    <span>{formatDate(race.date)}</span>
                    <span>•</span>
                    <span>{race.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(race.status)}`}>
                      {race.status.charAt(0).toUpperCase() + race.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70">
                      {getDistanceTypeDisplay(race.distance_type)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono mb-1">
                    {race.daysUntil}
                  </div>
                  <div className="text-xs text-white/60">
                    {race.daysUntil === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>

              {/* Countdown Progress Bar */}
              <div className="mb-3">
                <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-400 h-1.5 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(10, Math.min(100, ((90 - race.daysUntil) / 90) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Preparation Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    race.preparationStatus === 'excellent' ? 'bg-green-400' :
                    race.preparationStatus === 'good' ? 'bg-blue-400' :
                    race.preparationStatus === 'needs-attention' ? 'bg-orange-400' : 'bg-white/40'
                  }`}></div>
                  <span className={`text-xs font-medium ${getPreparationColor(race.preparationStatus)}`}>
                    {race.preparationStatus === 'excellent' ? 'Ready to race!' :
                     race.preparationStatus === 'good' ? 'On track' :
                     race.preparationStatus === 'needs-attention' ? 'Needs focus' : 'Unknown status'}
                  </span>
                </div>
                <button
                  onClick={() => router.push('/(tabs)/planning')}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Plan →
                </button>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>
                {upcomingRaces.filter(r => r.status === 'registered').length} registered races
              </span>
              <button
                onClick={() => router.push('/(tabs)/races')}
                className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
              >
                View All →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};