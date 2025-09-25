import React, { useState, useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../src/store';
import { dbHelpers } from '../../src/services/supabase';
import { GeolocationService } from '../../src/services/apiIntegrations';
import { useAuth } from '../../src/contexts/AuthContext';
import { AuthGuard } from '../../src/components/AuthGuard';
import { AddResultModal } from '../../src/components/AddResultModal';
import { UserRaceManagement } from '../../src/components/UserRaceManagement';
import { ImportedRaceUpdateModal } from '../../src/components/ImportedRaceUpdateModal';
import { router } from 'expo-router';
import {
  TbTrash,
  TbStar,
  TbClipboard,
  TbFlag,
  TbTrophy,
  TbClock,
  TbSearch
} from 'react-icons/tb';

// Icon component mapping
const iconComponents = {
  TbTrash,
  TbStar,
  TbClipboard,
  TbFlag,
  TbTrophy,
  TbClock,
  TbSearch
};

const renderIcon = (iconName: string, className = "w-4 h-4") => {
  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  return IconComponent ? <IconComponent className={className} /> : <span>{iconName}</span>;
};

// State name to abbreviation mapping
const STATE_ABBREVIATIONS: { [key: string]: string } = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC'
};

// Helper function to convert state name to abbreviation
const getStateAbbreviation = (state: string): string => {
  const cleanState = state.toLowerCase().trim();
  return STATE_ABBREVIATIONS[cleanState] || state.toUpperCase();
};

// Major city to zip code mapping for fallback searches
const CITY_ZIP_CODES: { [key: string]: string } = {
  // Major cities that might not work with city/state searches
  'charlotte,nc': '28202',
  'charlotte,north carolina': '28202',
  'atlanta,ga': '30309',
  'atlanta,georgia': '30309',
  'miami,fl': '33101',
  'miami,florida': '33101',
  'dallas,tx': '75201',
  'dallas,texas': '75201',
  'houston,tx': '77002',
  'houston,texas': '77002',
  'phoenix,az': '85001',
  'phoenix,arizona': '85001',
  'philadelphia,pa': '19102',
  'philadelphia,pennsylvania': '19102',
  'san antonio,tx': '78201',
  'san antonio,texas': '78201',
  'san diego,ca': '92101',
  'san diego,california': '92101',
  'detroit,mi': '48201',
  'detroit,michigan': '48201',
  'san jose,ca': '95101',
  'san jose,california': '95101',
  'austin,tx': '78701',
  'austin,texas': '78701',
  'jacksonville,fl': '32099',
  'jacksonville,florida': '32099',
  'fort worth,tx': '76102',
  'fort worth,texas': '76102',
  'columbus,oh': '43085',
  'columbus,ohio': '43085',
  'san francisco,ca': '94102',
  'san francisco,california': '94102',
  'indianapolis,in': '46201',
  'indianapolis,indiana': '46201',
  'seattle,wa': '98101',
  'seattle,washington': '98101',
  'denver,co': '80202',
  'denver,colorado': '80202',
  'washington,dc': '20001',
  'boston,ma': '02101',
  'boston,massachusetts': '02101',
  'nashville,tn': '37201',
  'nashville,tennessee': '37201',
  'memphis,tn': '38103',
  'memphis,tennessee': '38103',
  'portland,or': '97201',
  'portland,oregon': '97201',
  'las vegas,nv': '89101',
  'las vegas,nevada': '89101',
  'louisville,ky': '40202',
  'louisville,kentucky': '40202',
  'baltimore,md': '21201',
  'baltimore,maryland': '21201',
  'milwaukee,wi': '53202',
  'milwaukee,wisconsin': '53202',
  'albuquerque,nm': '87101',
  'albuquerque,new mexico': '87101',
  'tucson,az': '85701',
  'tucson,arizona': '85701',
  'fresno,ca': '93650',
  'fresno,california': '93650',
  'sacramento,ca': '94203',
  'sacramento,california': '94203',
  'kansas city,mo': '64108',
  'kansas city,missouri': '64108',
  'mesa,az': '85201',
  'mesa,arizona': '85201',
  'virginia beach,va': '23450',
  'virginia beach,virginia': '23450',
  'colorado springs,co': '80903',
  'colorado springs,colorado': '80903',
  'raleigh,nc': '27601',
  'raleigh,north carolina': '27601',
  'omaha,ne': '68102',
  'omaha,nebraska': '68102',
  'long beach,ca': '90802',
  'long beach,california': '90802',
  'virginia beach,va_2': '23451',
  'miami,fl_2': '33132',
  'oakland,ca': '94612',
  'oakland,california': '94612',
  'minneapolis,mn': '55401',
  'minneapolis,minnesota': '55401',
  'tulsa,ok': '74103',
  'tulsa,oklahoma': '74103',
  'tampa,fl': '33602',
  'tampa,florida': '33602',
  'arlington,tx': '76010',
  'arlington,texas': '76010',
  'new orleans,la': '70112',
  'new orleans,louisiana': '70112'
};

// Helper function removed (unused)

// Helper function to determine specific race distance from name and description
const determineRaceDistance = (race: any): string => {
  const name = (race.name || '').toLowerCase();
  const description = (race.description || '').toLowerCase();
  const combined = `${name} ${description}`;
  
  // Check for specific distance patterns
  if (combined.includes('ironman 70.3') || combined.includes('half ironman') || combined.includes('70.3')) {
    return '70.3';
  }
  if (combined.includes('full ironman') || combined.includes('ironman ') && !combined.includes('70.3')) {
    return 'ironman';
  }
  if (combined.includes('olympic') || combined.includes('international')) {
    return 'olympic';
  }
  if (combined.includes('sprint')) {
    return 'sprint';
  }
  
  // Default fallback
  return 'triathlon';
};

function RacesScreenContent() {
  const { user } = useAuth();
  
  // State management
  const [activeSection, setActiveSection] = useState<'discover' | 'upcoming' | 'past' | 'created'>('upcoming');
  const [discoveredRaces, setDiscoveredRaces] = useState<any[]>([]);
  const [myRaces, setMyRaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState('50');
  const [raceDistance, setRaceDistance] = useState('all');
  const [, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Race management states
  const [savedRaces, setSavedRaces] = useState<string[]>([]);
  const [savingRaces, setSavingRaces] = useState<string[]>([]);
  
  // Add Result Modal state
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [userCreatedRaces, setUserCreatedRaces] = useState<any[]>([]);

  // Race Update Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [raceToUpdate, setRaceToUpdate] = useState<any>(null);

  // Cache management states
  const [raceCache, setRaceCache] = useState<{[key: string]: {data: any[], timestamp: number}}>({});
  const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

  // Load user-created races for the results modal
  const loadUserCreatedRaces = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await dbHelpers.userRaces.getAll();
      if (error) {
        console.error('Error loading user-created races:', error);
        setUserCreatedRaces([]);
      } else {
        setUserCreatedRaces(data || []);
      }
    } catch (error) {
      console.error('Error loading user-created races:', error);
      setUserCreatedRaces([]);
    }
  }, [user]);

  const loadMyRaces = useCallback(async () => {
    if (!user) return;

    try {
      // Try to load user's planned races from database first
      const { data, error } = await dbHelpers.userPlannedRaces.getAll();

      // Database query result (debug log removed)

      if (error) {
        // Handle feature disabled gracefully (not a real error)
        if (error.code === 'FEATURE_DISABLED') {
          // Planned races feature is disabled (debug log removed)
        } else {
          console.error('Error loading planned races:', error);
        }
        return;
      }
      
      // Transform database data to component format
      const transformedRaces = (data || []).map(plannedRace => {
        const externalRace = plannedRace.external_races;
        return {
          id: plannedRace.id,
          externalRaceId: externalRace?.id,
          name: externalRace?.name || plannedRace.race_name || 'Unknown Race',
          location: externalRace?.location || plannedRace.race_location || 'Location TBD',
          date: externalRace?.date || plannedRace.race_date || new Date().toISOString(),
          distance_type: externalRace?.distance_type || plannedRace.distance_type || 'triathlon',
          status: plannedRace.status || 'interested',
          description: externalRace?.description || plannedRace.description || '',
          source: 'Saved Race',
          difficulty_score: externalRace?.difficulty_score,
          swim_type: externalRace?.swim_type,
          bike_elevation_gain: externalRace?.bike_elevation_gain,
          wetsuit_legal: externalRace?.wetsuit_legal,
          registration_url: externalRace?.registration_url || externalRace?.website
        };
      });
      
      setMyRaces(transformedRaces);
      setSavedRaces(transformedRaces.map(race => race.id));

      // Also backup to localStorage for consistency
      try {
        const localRacesKey = `saved_races_${user.id}`;
        localStorage.setItem(localRacesKey, JSON.stringify(transformedRaces));
        // Database races backed up to localStorage (debug log removed)
      } catch (localError) {
        console.warn('Error backing up database races to localStorage:', localError);
      }
    } catch (error) {
      console.error('Error loading my races:', error);
      // Fallback to empty array
      setMyRaces([]);
      setSavedRaces([]);
    }
  }, [user]);

  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadMyRaces(),
        loadUserCreatedRaces(),
        // Don't auto-load discovered races - let user search
      ]);
    } catch (error) {
      console.error('Error initializing races data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadMyRaces]);

  const loadSavedRaces = useCallback(async () => {
    // Now handled by loadMyRaces - this function kept for compatibility
    await loadMyRaces();
  }, [loadMyRaces]);

  useEffect(() => {
    initializeData();
    getCurrentLocation();
    loadSavedRaces();
  }, [user, initializeData, loadSavedRaces]);

  // Create combined races array for the AddResultModal
  const getAllRacesForResults = () => {
    // Combine saved races (external) and user-created races for the results modal
    const combinedRaces = [
      ...userCreatedRaces.map(race => ({ ...race, source: 'user_created' })),
      ...myRaces.map(race => ({ ...race, source: 'saved' }))
    ];

    // Remove duplicates and sort by date
    const uniqueRaces = combinedRaces.filter((race, index, arr) =>
      arr.findIndex(r => r.id === race.id && r.source === race.source) === index
    );

    return uniqueRaces.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Helper function to generate cache key from search parameters
  const generateCacheKey = (locationQuery: string, searchRadius: string, raceDistance: string) => {
    return `${locationQuery.trim()}_${searchRadius}_${raceDistance}`;
  };

  const discoverRaces = async () => {
    if (isSyncing) return;
    
    // Check cache first
    const cacheKey = generateCacheKey(locationQuery, searchRadius, raceDistance);
    const cached = raceCache[cacheKey];
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION_MS) {
      // Using cached race data (debug log removed)
      setDiscoveredRaces(cached.data);
      return;
    }
    
    setIsSyncing(true);
    try {
      // Discovering races from RunSignup API (debug log removed)
      
      const params = new URLSearchParams({
        results_per_page: '100',
        start_date: new Date().toISOString().split('T')[0],
        event_type: 'triathlon'
      });
      
      if (locationQuery.trim()) {
        const location = locationQuery.trim();
        // Check if location looks like a zip code (5 digits)
        if (/^\d{5}$/.test(location)) {
          params.append('zipcode', location);
        } else {
          // For city, state format, try to parse and use specific parameters
          // First try to match "City, ST" (2-letter abbreviation)
          const cityStateMatch = location.match(/^(.+),\s*([A-Z]{2})$/i);
          if (cityStateMatch) {
            // Format: "City, ST"
            params.append('city', cityStateMatch[1].trim());
            params.append('state', cityStateMatch[2].trim().toUpperCase());
          } else {
            // Try to match "City, StateName" (full state name)
            const cityFullStateMatch = location.match(/^(.+),\s*(.+)$/i);
            if (cityFullStateMatch) {
              const cityName = cityFullStateMatch[1].trim();
              const statePart = cityFullStateMatch[2].trim();
              const stateAbbrev = getStateAbbreviation(statePart);

              // Only use this format if we successfully converted a known state name
              if (stateAbbrev !== statePart.toUpperCase() || statePart.length === 2) {
                params.append('city', cityName);
                params.append('state', stateAbbrev);
              } else {
                // If state conversion failed, treat the whole thing as a city search
                params.append('city', location);
              }
            } else if (location.match(/^[A-Z]{2}$/i)) {
              // Just a state abbreviation
              params.append('state', location.toUpperCase());
            } else {
              // Check if it's just a full state name
              const stateAbbrev = getStateAbbreviation(location);
              if (stateAbbrev !== location.toUpperCase()) {
                // It was a recognized state name
                params.append('state', stateAbbrev);
              } else {
                // City name only or other text - use city parameter
                params.append('city', location);
              }
            }
          }
        }
      }
      
      if (searchRadius && searchRadius !== 'all') {
        params.append('radius', searchRadius);
      }

      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
      const requestUrl = `${apiBaseUrl}/runsignup/search?${params.toString()}`;
      // API request URL (debug log removed)

      const response = await fetch(requestUrl);
      // API response status and headers (debug logs removed)

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RACE DISCOVERY] API error response:', errorText);

        // If external API is not available, provide sample races for demo
        console.warn('External race API not available, using sample data');
        const sampleRaces = [
          {
            id: 'sample-1',
            name: 'Atlanta Sprint Triathlon 2025',
            location: 'Atlanta, GA',
            date: '2025-06-15',
            distance_type: 'sprint',
            description: 'A beautiful lake course perfect for beginners and experienced athletes',
            registration_url: 'https://example.com/register',
            source: 'Sample Data'
          },
          {
            id: 'sample-2', 
            name: 'Chattanooga Olympic Triathlon 2025',
            location: 'Chattanooga, TN',
            date: '2025-09-22',
            distance_type: 'olympic',
            description: 'Challenging bike course with rolling hills and scenic views',
            registration_url: 'https://example.com/register',
            source: 'Sample Data'
          },
          {
            id: 'sample-3',
            name: 'Blue Ridge 70.3 Triathlon 2025',
            location: 'Asheville, NC', 
            date: '2025-08-10',
            distance_type: '70.3',
            description: 'Half-distance triathlon in the beautiful Blue Ridge Mountains',
            registration_url: 'https://example.com/register',
            source: 'Sample Data'
          }
        ];
        setDiscoveredRaces(sampleRaces);
        return;
      }
      
      const responseText = await response.text();
      // Raw response text (debug log removed)

      let data;
      try {
        data = JSON.parse(responseText);
        // Parsed JSON response (debug log removed)
      } catch (parseError) {
        console.error('[RACE DISCOVERY] JSON parse error:', parseError);
        console.error('[RACE DISCOVERY] Response was not valid JSON, full text:', responseText);
        throw parseError;
      }
      
      if (data.races && data.races.length > 0) {
        const transformedRaces = data.races.map((raceWrapper, index) => {
            const race = raceWrapper.race || raceWrapper;
            const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
            
            // Determine specific distance instead of generic "triathlon"
            const specificDistance = determineRaceDistance(race);
            
            return {
              id: race.race_id || `discovered-${Date.now()}-${index}`,
              name: race.name || 'Unnamed Race',
              location: race.address ? `${race.address.city || ''}, ${race.address.state || ''}` : 'Location TBD',
              date: race.next_date || race.last_date || new Date().toISOString(),
              distance_type: specificDistance,
              description: stripHtml(race.description) || 'Triathlon race',
              website: race.url || '#',
              registration_url: race.url || '#',
              source: 'RunSignup',
              status: 'discovered',
              price_min: race.price_min,
              currency: race.currency,
              is_sold_out: race.is_sold_out,
              spots_available: race.spots_available
            };
          });
          
          setDiscoveredRaces(transformedRaces);
          
          // Cache the results
          setRaceCache(prev => ({
            ...prev,
            [cacheKey]: {
              data: transformedRaces,
              timestamp: now
            }
          }));
          
          // Discovered races and cached (debug log removed)
        } else {
          // No races found from RunSignup API (debug log removed)
          setDiscoveredRaces([]);
        }
    } catch (error) {
      console.warn('Error discovering races from external API, using sample data:', error);
      // Provide sample races as fallback when external API fails
      const sampleRaces = [
        {
          id: 'sample-1',
          name: 'Atlanta Sprint Triathlon 2025',
          location: 'Atlanta, GA',
          date: '2025-06-15',
          distance_type: 'sprint',
          description: 'A beautiful lake course perfect for beginners and experienced athletes',
          registration_url: 'https://example.com/register',
          source: 'Sample Data'
        },
        {
          id: 'sample-2', 
          name: 'Chattanooga Olympic Triathlon 2025',
          location: 'Chattanooga, TN',
          date: '2025-09-22',
          distance_type: 'olympic',
          description: 'Challenging bike course with rolling hills and scenic views',
          registration_url: 'https://example.com/register',
          source: 'Sample Data'
        },
        {
          id: 'sample-3',
          name: 'Blue Ridge 70.3 Triathlon 2025',
          location: 'Asheville, NC', 
          date: '2025-08-10',
          distance_type: '70.3',
          description: 'Half-distance triathlon in the beautiful Blue Ridge Mountains',
          registration_url: 'https://example.com/register',
          source: 'Sample Data'
        }
      ];
      setDiscoveredRaces(sampleRaces);
    } finally {
      setIsSyncing(false);
    }
  };

  const getCurrentLocation = async () => {
    const location = await GeolocationService.getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  const saveRace = async (race: any) => {
    if (!user || !race.id) return;

    // Check if race is already saved by external ID or name+date combination
    const isAlreadySaved = myRaces.some(savedRace =>
      savedRace.externalRaceId === race.id ||
      (savedRace.name === race.name && savedRace.date === race.date)
    );

    if (isAlreadySaved) {
      alert('This race is already saved!');
      return;
    }

    try {
      setSavingRaces(prev => [...prev, race.id]);

      // Try to save to database first - need to create external race first, then planned race

      // Step 1: Create external race entry (only with fields that exist in the table)
      const externalRaceData = {
        external_id: race.id, // The original race ID from the external source
        api_source: race.source || 'unknown',
        name: race.name,
        date: race.date,
        location: race.location,
        city: race.city || '',
        state: race.state || '',
        country: race.country || 'US',
        ...(race.latitude && { latitude: race.latitude }),
        ...(race.longitude && { longitude: race.longitude }),
        distance_type: ['sprint', 'olympic', '70.3', 'ironman'].includes(race.distance_type) ? race.distance_type : 'other',
        ...(race.difficulty && ['beginner', 'intermediate', 'advanced', 'expert'].includes(race.difficulty) && { difficulty: race.difficulty }),
        ...(race.registration_url && { registration_url: race.registration_url }),
        ...(race.website && !race.registration_url && { registration_url: race.website }),
        ...(race.price_min && { price_min: race.price_min }),
        ...(race.price_max && { price_max: race.price_max }),
        currency: race.currency || 'USD',
        ...(race.spots_available && { spots_available: race.spots_available }),
        ...(race.spots_total && { spots_total: race.spots_total }),
        is_sold_out: race.is_sold_out || false,
        description: race.description || '',
        ...(race.features && { features: JSON.stringify(race.features) }),

        // Triathlon-specific fields
        ...(race.swim_type && ['pool', 'open_water', 'river', 'lake', 'ocean'].includes(race.swim_type) && { swim_type: race.swim_type }),
        ...(race.swim_distance_meters && { swim_distance_meters: race.swim_distance_meters }),
        ...(race.bike_distance_meters && { bike_distance_meters: race.bike_distance_meters }),
        ...(race.bike_elevation_gain && { bike_elevation_gain: race.bike_elevation_gain }),
        ...(race.run_distance_meters && { run_distance_meters: race.run_distance_meters }),
        ...(race.wetsuit_legal !== undefined && { wetsuit_legal: race.wetsuit_legal }),
        ...(race.transition_area && { transition_area: race.transition_area }),
        ...(race.course_description && { course_description: race.course_description }),
        ...(race.difficulty_score && race.difficulty_score >= 1 && race.difficulty_score <= 10 && { difficulty_score: race.difficulty_score }),
        ...(race.wave_start !== undefined && { wave_start: race.wave_start }),
        ...(race.qualifying_race !== undefined && { qualifying_race: race.qualifying_race }),
        ...(race.age_group_categories && { age_group_categories: JSON.stringify(race.age_group_categories) }),
        ...(race.awards_info && { awards_info: race.awards_info }),
        ...(race.course_records && { course_records: JSON.stringify(race.course_records) }),
        ...(race.weather_conditions && { weather_conditions: race.weather_conditions }),
        ...(race.water_temperature_avg && { water_temperature_avg: race.water_temperature_avg }),
        ...(race.draft_legal !== undefined && { draft_legal: race.draft_legal })
      };

      const { data: externalRace, error: externalError } = await dbHelpers.externalRaces.create(externalRaceData);

      if (externalError && !externalError.message?.includes('duplicate')) {
        console.warn('Failed to create external race:', externalError);
        throw externalError;
      }

      // If it's a duplicate, find the existing one
      let externalRaceId = externalRace?.id;
      if (externalError?.message?.includes('duplicate')) {
        // Try to find existing external race by external_id
        const { data: existingRaces } = await dbHelpers.externalRaces.getAll();
        const existingRace = existingRaces?.find(r => r.external_id === race.id);
        externalRaceId = existingRace?.id;
      }

      if (!externalRaceId) {
        throw new Error('Failed to get external race ID');
      }

      // Step 2: Create user planned race entry
      const plannedRaceData = {
        external_race_id: externalRaceId,
        status: 'interested'
      };

      const { data: _, error } = await dbHelpers.userPlannedRaces.create(plannedRaceData);

      if (error) {
        console.warn('Database save failed, using local state and localStorage:', error);
        // Fallback to local state and localStorage
        const localSavedRace = {
          ...race,
          id: `local-${Date.now()}`,
          externalRaceId: race.id,
          status: 'interested',
          saved_at: new Date().toISOString()
        };

        const updatedRaces = [...myRaces, localSavedRace];
        setMyRaces(updatedRaces);
        setSavedRaces(prev => [...prev, race.id]);

        // Save to localStorage as backup
        try {
          const localRacesKey = `saved_races_${user.id}`;
          localStorage.setItem(localRacesKey, JSON.stringify(updatedRaces));
          // Race saved to localStorage as backup (debug log removed)
        } catch (localError) {
          console.warn('Error saving to localStorage:', localError);
        }
      } else {
        // Race saved to database (debug log removed)
        // Refresh the races list to get the updated data from the database
        await loadMyRaces();
      }

      // Show success feedback
      alert(`"${race.name}" has been saved to your races!`);

    } catch (error) {
      console.error('Error saving race:', error);
      alert('Failed to save race. Please try again.');
    } finally {
      setSavingRaces(prev => prev.filter(id => id !== race.id));
    }
  };

  const unsaveRace = async (raceId: string) => {
    if (!user) return;

    try {
      setSavingRaces(prev => [...prev, raceId]);

      // Find the race to remove by external ID or internal ID
      const raceToRemove = myRaces.find(race =>
        race.externalRaceId === raceId || race.id === raceId
      );

      if (raceToRemove) {
        // Try to remove from database first
        try {
          const { error } = await dbHelpers.userPlannedRaces.delete(raceToRemove.id);
          if (error) {
            console.warn('Database delete failed, removing from local state only:', error);
          }
          // Race removed from database (debug log removed)
        } catch (dbError) {
          console.warn('Database delete error, proceeding with local removal:', dbError);
        }

        // Always remove from local state (for both database and local-only races)
        const updatedRaces = myRaces.filter(race =>
          race.externalRaceId !== raceId && race.id !== raceId
        );
        setMyRaces(updatedRaces);
        setSavedRaces(prev => prev.filter(id => id !== raceId));

        // Update localStorage as backup
        try {
          const localRacesKey = `saved_races_${user.id}`;
          localStorage.setItem(localRacesKey, JSON.stringify(updatedRaces));
          // Race removed from localStorage backup (debug log removed)
        } catch (localError) {
          console.warn('Error updating localStorage:', localError);
        }

        alert(`"${raceToRemove.name}" has been removed from your saved races.`);
        // Race removed from saved races (debug log removed)

        // Refresh data to stay in sync with database
        await loadMyRaces();
      }

    } catch (error) {
      console.error('Error removing race:', error);
      alert('Failed to remove race. Please try again.');
    } finally {
      setSavingRaces(prev => prev.filter(id => id !== raceId));
    }
  };

  const updateRaceStatus = async (raceId: string, newStatus: 'interested' | 'registered' | 'completed') => {
    if (!user) return;

    try {
      // Find the race to determine if it's user-created or external
      const race = [...myRaces, ...userCreatedRaces].find(r => r.id === raceId);
      if (!race) {
        alert('Race not found.');
        return;
      }

      const isUserCreated = race.source === 'user_created' || userCreatedRaces.some(ur => ur.id === raceId);

      // Update local state immediately for responsiveness
      if (isUserCreated) {
        setUserCreatedRaces(prev => prev.map(race =>
          race.id === raceId ? { ...race, status: newStatus } : race
        ));
      } else {
        setMyRaces(prev => prev.map(race =>
          race.id === raceId ? { ...race, status: newStatus } : race
        ));
      }

      // Save to database using the appropriate helper
      const { error } = isUserCreated
        ? await dbHelpers.userRaces.updateStatus(raceId, newStatus)
        : await dbHelpers.userPlannedRaces.updateStatus(raceId, newStatus);

      if (error) {
        console.error('Error updating race status in database:', error);
        // Revert local state if database update fails
        if (isUserCreated) {
          setUserCreatedRaces(prev => prev.map(race =>
            race.id === raceId ? { ...race, status: race.status } : race
          ));
        } else {
          setMyRaces(prev => prev.map(race =>
            race.id === raceId ? { ...race, status: race.status } : race
          ));
        }
        alert('Failed to update race status. Please try again.');
        return;
      }

      // Also update localStorage as backup
      try {
        const localRacesKey = `saved_races_${user.id}`;
        const updatedRaces = myRaces.map(race =>
          race.id === raceId ? { ...race, status: newStatus } : race
        );
        localStorage.setItem(localRacesKey, JSON.stringify(updatedRaces));
      } catch (localError) {
        console.warn('Error updating localStorage:', localError);
      }

      // Race status updated successfully (debug log removed)
    } catch (error) {
      console.error('Error updating race status:', error);
      alert('Failed to update race status. Please try again.');
    }
  };

  // Handle opening update modal
  const openUpdateModal = (race: any) => {
    setRaceToUpdate(race);
    setShowUpdateModal(true);
  };

  // Handle closing update modal
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setRaceToUpdate(null);
  };

  // Handle race update completion
  const handleRaceUpdate = () => {
    console.log('handleRaceUpdate called - refreshing race data...');

    // Force reload by clearing any cache
    setMyRaces([]);
    setUserCreatedRaces([]);

    // Wait a bit then reload to ensure cache is cleared
    setTimeout(() => {
      loadMyRaces();
      loadUserCreatedRaces();
    }, 100);
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

      const { data: _, error } = await dbHelpers.raceResults.add(raceResultWithUser);
      
      if (error) {
        console.error('Error adding race result:', error);
        alert('Failed to save race result. Please try again.');
        return;
      }

      alert('Race result added successfully!');
      setShowAddResultModal(false);

      // Optionally reload race data to show updated information
      loadMyRaces();
      loadUserCreatedRaces();
    } catch (error) {
      console.error('Error adding race result:', error);
      alert('Failed to save race result. Please try again.');
    }
  };

  // Filter functions
  const filterRaces = (races: any[], query: string = searchQuery) => {
    if (!query) return races;
    
    return races.filter(race =>
      race.name?.toLowerCase().includes(query.toLowerCase()) ||
      race.location?.toLowerCase().includes(query.toLowerCase()) ||
      race.distance_type?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterByDistance = (races: any[]) => {
    if (raceDistance === 'all') return races;
    return races.filter(race => 
      race.distance_type?.toLowerCase().includes(raceDistance.toLowerCase())
    );
  };

  const getUpcomingRaces = () => {
    // Combine both saved external races and user-created races
    const allRaces = [
      ...myRaces,
      ...userCreatedRaces.map(race => ({ ...race, source: 'user_created', status: 'interested' }))
    ];

    const upcoming = allRaces.filter(race => {
      const raceDate = new Date(race.date);
      return raceDate >= new Date() && race.status !== 'completed';
    });
    return filterByDistance(filterRaces(upcoming));
  };

  const getPastRaces = () => {
    // Combine both saved external races and user-created races
    const allRaces = [
      ...myRaces,
      ...userCreatedRaces.map(race => ({ ...race, source: 'user_created', status: 'completed' }))
    ];

    const past = allRaces.filter(race => {
      const raceDate = new Date(race.date);
      return raceDate < new Date() || race.status === 'completed';
    });
    return filterByDistance(filterRaces(past));
  };

  const getFilteredDiscoveredRaces = () => {
    return filterByDistance(filterRaces(discoveredRaces));
  };

  const renderRaceCard = (race: any, showSaveButton: boolean = true) => (
    <div key={race.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 shadow-xl hover:bg-white/10 transition-all duration-300 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{race.name}</h3>
          <p className="text-blue-400 font-medium">{new Date(race.date).toLocaleDateString()}</p>
          <p className="text-white/70 text-sm break-words">{race.location}</p>
          {race.source && (
            <p className="text-white/50 text-xs mt-1">Source: {race.source}</p>
          )}
        </div>
        <div className="flex sm:flex-col items-start sm:items-end gap-2">
          <span className="bg-orange-500/20 text-orange-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize whitespace-nowrap">
            {race.distance_type}
          </span>
          {race.status && !showSaveButton && (
            <div className="relative">
              <select
                value={race.status}
                onChange={(e) => updateRaceStatus(race.id, e.target.value as 'interested' | 'registered' | 'completed')}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-transparent border-0 outline-none cursor-pointer ${
                  race.status === 'registered' ? 'bg-green-500/20 text-green-300' :
                  race.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}
              >
                <option value="interested">Interested</option>
                <option value="registered">Registered</option>
                <option value="completed">Complete</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {race.description && (
        <p className="text-white/70 mb-4 text-sm line-clamp-2 break-words">{race.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {race.price_min && (
          <div>
            <span className="text-white/60 text-xs">Entry Fee:</span>
            <div className="text-green-400 font-bold">
              {race.currency === 'EUR' ? '€' : '$'}{race.price_min}
            </div>
          </div>
        )}
        {race.difficulty_score && (
          <div>
            <span className="text-white/60 text-xs">Difficulty:</span>
            <div className="text-white font-medium">{race.difficulty_score}/10</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Action buttons row */}
        <div className="grid grid-cols-3 gap-2">
          {showSaveButton && user && (
            <>
              <button
                className={`py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1 ${
                  savedRaces.includes(race.id)
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                }`}
                onClick={() => savedRaces.includes(race.id) ? unsaveRace(race.id) : saveRace(race)}
                disabled={savingRaces.includes(race.id)}
              >
                {savingRaces.includes(race.id) ? (
                  <span className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {savedRaces.includes(race.id) ? 'Removing...' : 'Saving...'}
                  </span>
                ) : savedRaces.includes(race.id) ? (
                  <span className="flex items-center justify-center gap-1"><TbTrash className="w-4 h-4" /> Remove</span>
                ) : (
                  <span className="flex items-center justify-center gap-1"><TbStar className="w-4 h-4" /> Save</span>
                )}
              </button>
              <button
                className="py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1"
                onClick={() => race.registration_url && window.open(race.registration_url, '_blank')}
              >
                Register
              </button>
              <div className="col-span-1"></div>
            </>
          )}

          {!showSaveButton && (
            <>
              {/* Update Race Details button */}
              <button
                className="py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1"
                onClick={() => openUpdateModal(race)}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update
                </span>
              </button>

              {/* Planning button for saved races */}
              <button
                className="py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1"
                onClick={() => {
                  // Store the race data in localStorage for the Planning tab to access
                  localStorage.setItem('selectedRaceForPlanning', JSON.stringify(race));
                  // Navigate to Planning tab
                  router.push('/planning');
                }}
              >
                <span className="flex items-center justify-center gap-1"><TbClipboard className="w-4 h-4" /> Plan Race</span>
              </button>

              {/* Remove button for saved races */}
              <button
                className="py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1"
                onClick={() => unsaveRace(race.externalRaceId || race.id)}
                disabled={savingRaces.includes(race.externalRaceId || race.id)}
              >
                {savingRaces.includes(race.externalRaceId || race.id) ? (
                  <span className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Removing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1"><TbTrash className="w-4 h-4" /> Remove</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Provider store={store}>
      <div className="bg-slate-900 relative overflow-auto" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20"></div>
          <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 p-6 pb-24 w-full max-w-full overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2">My Races</h1>
              <p className="text-lg text-white/70">Discover, save, and manage your triathlon races</p>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Search races..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'upcoming', label: 'My Upcoming Races', icon: 'TbFlag', count: getUpcomingRaces().length },
              { id: 'past', label: 'My Past Races', icon: 'TbTrophy', count: getPastRaces().length },
              { id: 'created', label: 'My Created Races', icon: 'TbClipboard', count: 0 },
              { id: 'discover', label: 'Discover New Races', icon: 'TbSearch', count: getFilteredDiscoveredRaces().length }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {renderIcon(section.icon, "w-5 h-5")}
                {section.label}
                {section.count > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">{section.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Discovery Search Controls */}
          {activeSection === 'discover' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Race Discovery
              </h3>
              
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="City, State, or Zip Code"
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Search Radius</label>
                  <select
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Nationwide</option>
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                    <option value="250">250 miles</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Distance Filter</label>
                  <select
                    value={raceDistance}
                    onChange={(e) => setRaceDistance(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Distances</option>
                    <option value="sprint">Sprint</option>
                    <option value="olympic">Olympic</option>
                    <option value="70.3">70.3</option>
                    <option value="ironman">Ironman</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={discoverRaces}
                disabled={isSyncing}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Discovering Races...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Discover Races
                  </>
                )}
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-white text-lg">Loading races...</div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-full overflow-hidden">
              {activeSection === 'upcoming' && (
                <>
                  {getUpcomingRaces().length > 0 ? (
                    getUpcomingRaces().map(race => renderRaceCard(race, false))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70 mb-4">No upcoming races found.</p>
                      <button
                        onClick={() => setActiveSection('discover')}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        Discover Races
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeSection === 'past' && (
                <>
                  {/* Add Race Result Button */}
                  <div className="col-span-full mb-6">
                    <button
                      onClick={() => setShowAddResultModal(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <TbClock className="w-5 h-5" />
                      Add Race Result
                    </button>
                  </div>
                  
                  {getPastRaces().length > 0 ? (
                    getPastRaces().map(race => renderRaceCard(race, false))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70">No past races found.</p>
                    </div>
                  )}
                </>
              )}

              {activeSection === 'created' && (
                <div className="col-span-full">
                  <UserRaceManagement onRaceUpdate={loadMyRaces} />
                </div>
              )}

              {activeSection === 'discover' && (
                <>
                  {getFilteredDiscoveredRaces().length > 0 ? (
                    getFilteredDiscoveredRaces().map(race => renderRaceCard(race, true))
                  ) : discoveredRaces.length === 0 && !isSyncing ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70 mb-4">Click &quot;Discover Races&quot; to find triathlon races in your area.</p>
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70">No races match your current filters.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Add Result Modal */}
        {showAddResultModal && (
          <AddResultModal
            onClose={() => setShowAddResultModal(false)}
            onSubmit={handleAddRaceResult}
            races={getAllRacesForResults()}
          />
        )}

        {/* Race Update Modal */}
        {showUpdateModal && raceToUpdate && (
          <ImportedRaceUpdateModal
            key={raceToUpdate.id}
            race={raceToUpdate}
            onClose={closeUpdateModal}
            onUpdate={handleRaceUpdate}
          />
        )}
      </div>
    </Provider>
  );
}

export default function RacesScreen() {
  return (
    <Provider store={store}>
      <AuthGuard>
        <RacesScreenContent />
      </AuthGuard>
    </Provider>
  );
}