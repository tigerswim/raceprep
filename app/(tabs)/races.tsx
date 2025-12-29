import React, { useState, useEffect, useCallback } from "react";
import { Provider } from "react-redux";
import { store } from "../../src/store";
import { dbHelpers } from "../../src/services/supabase";
import { GeolocationService } from "../../src/services/apiIntegrations";
import { useAuth } from "../../src/contexts/AuthContext";
import { AuthGuard } from "../../src/components/AuthGuard";
import { AddResultModal } from "../../src/components/AddResultModal";
import { UserRaceManagement } from "../../src/components/UserRaceManagement";
import { ImportedRaceUpdateModal } from "../../src/components/ImportedRaceUpdateModal";
import { router } from "expo-router";
import {
  TbTrash,
  TbStar,
  TbClipboard,
  TbFlag,
  TbTrophy,
  TbClock,
  TbSearch,
} from "react-icons/tb";

// Icon component mapping
const iconComponents = {
  TbTrash,
  TbStar,
  TbClipboard,
  TbFlag,
  TbTrophy,
  TbClock,
  TbSearch,
};

const renderIcon = (iconName: string, className = "w-4 h-4") => {
  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  return IconComponent ? (
    <IconComponent className={className} />
  ) : (
    <span>{iconName}</span>
  );
};

// State name to abbreviation mapping
const STATE_ABBREVIATIONS: { [key: string]: string } = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

// Helper function to convert state name to abbreviation
const getStateAbbreviation = (state: string): string => {
  const cleanState = state.toLowerCase().trim();
  return STATE_ABBREVIATIONS[cleanState] || state.toUpperCase();
};

// Major city to zip code mapping for fallback searches
const CITY_ZIP_CODES: { [key: string]: string } = {
  // Major cities that might not work with city/state searches
  chattanooga: "37341",
  "chattanooga,tn": "37341",
  "chattanooga,tennessee": "37341",
  "charlotte,nc": "28202",
  "charlotte,north carolina": "28202",
  "atlanta,ga": "30309",
  "atlanta,georgia": "30309",
  "miami,fl": "33101",
  "miami,florida": "33101",
  "dallas,tx": "75201",
  "dallas,texas": "75201",
  "houston,tx": "77002",
  "houston,texas": "77002",
  "phoenix,az": "85001",
  "phoenix,arizona": "85001",
  "philadelphia,pa": "19102",
  "philadelphia,pennsylvania": "19102",
  "san antonio,tx": "78201",
  "san antonio,texas": "78201",
  "san diego,ca": "92101",
  "san diego,california": "92101",
  "detroit,mi": "48201",
  "detroit,michigan": "48201",
  "san jose,ca": "95101",
  "san jose,california": "95101",
  "austin,tx": "78701",
  "austin,texas": "78701",
  "jacksonville,fl": "32099",
  "jacksonville,florida": "32099",
  "fort worth,tx": "76102",
  "fort worth,texas": "76102",
  "columbus,oh": "43085",
  "columbus,ohio": "43085",
  "san francisco,ca": "94102",
  "san francisco,california": "94102",
  "indianapolis,in": "46201",
  "indianapolis,indiana": "46201",
  "seattle,wa": "98101",
  "seattle,washington": "98101",
  "denver,co": "80202",
  "denver,colorado": "80202",
  "washington,dc": "20001",
  "boston,ma": "02101",
  "boston,massachusetts": "02101",
  "nashville,tn": "37201",
  "nashville,tennessee": "37201",
  "memphis,tn": "38103",
  "memphis,tennessee": "38103",
  "portland,or": "97201",
  "portland,oregon": "97201",
  "las vegas,nv": "89101",
  "las vegas,nevada": "89101",
  "louisville,ky": "40202",
  "louisville,kentucky": "40202",
  "baltimore,md": "21201",
  "baltimore,maryland": "21201",
  "milwaukee,wi": "53202",
  "milwaukee,wisconsin": "53202",
  "albuquerque,nm": "87101",
  "albuquerque,new mexico": "87101",
  "tucson,az": "85701",
  "tucson,arizona": "85701",
  "fresno,ca": "93650",
  "fresno,california": "93650",
  "sacramento,ca": "94203",
  "sacramento,california": "94203",
  "kansas city,mo": "64108",
  "kansas city,missouri": "64108",
  "mesa,az": "85201",
  "mesa,arizona": "85201",
  "virginia beach,va": "23450",
  "virginia beach,virginia": "23450",
  "colorado springs,co": "80903",
  "colorado springs,colorado": "80903",
  "raleigh,nc": "27601",
  "raleigh,north carolina": "27601",
  "omaha,ne": "68102",
  "omaha,nebraska": "68102",
  "long beach,ca": "90802",
  "long beach,california": "90802",
  "virginia beach,va_2": "23451",
  "miami,fl_2": "33132",
  "oakland,ca": "94612",
  "oakland,california": "94612",
  "minneapolis,mn": "55401",
  "minneapolis,minnesota": "55401",
  "tulsa,ok": "74103",
  "tulsa,oklahoma": "74103",
  "tampa,fl": "33602",
  "tampa,florida": "33602",
  "arlington,tx": "76010",
  "arlington,texas": "76010",
  "new orleans,la": "70112",
  "new orleans,louisiana": "70112",
};

// Helper function removed (unused)

// Helper function to determine specific race distance from name and description
const determineRaceDistance = (race: any): string => {
  const name = (race.name || "").toLowerCase();
  const description = (race.description || "").toLowerCase();
  const combined = `${name} ${description}`;

  // Check for specific distance patterns
  if (
    combined.includes("ironman 70.3") ||
    combined.includes("half ironman") ||
    combined.includes("70.3")
  ) {
    return "70.3";
  }
  if (
    combined.includes("full ironman") ||
    (combined.includes("ironman ") && !combined.includes("70.3"))
  ) {
    return "ironman";
  }
  if (combined.includes("olympic") || combined.includes("international")) {
    return "olympic";
  }
  if (combined.includes("sprint")) {
    return "sprint";
  }

  // Default fallback
  return "triathlon";
};

function RacesScreenContent() {
  const { user } = useAuth();

  // State management
  const [activeSection, setActiveSection] = useState<
    "discover" | "upcoming" | "past"
  >("upcoming");
  const [discoveredRaces, setDiscoveredRaces] = useState<any[]>([]);
  const [myRaces, setMyRaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  const [isSyncing, setIsSyncing] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchRadius, setSearchRadius] = useState("50");
  const [raceDistance, setRaceDistance] = useState("all");
  const [, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Race management states
  const [savedRaces, setSavedRaces] = useState<string[]>([]);
  const [savingRaces, setSavingRaces] = useState<string[]>([]);

  // Add Result Modal state
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [userCreatedRaces, setUserCreatedRaces] = useState<any[]>([]);

  // Race Update Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [raceToUpdate, setRaceToUpdate] = useState<any>(null);

  // Enhanced cache management
  const [raceCache, setRaceCache] = useState<{
    [key: string]: { data: any[]; timestamp: number };
  }>({});
  const [userDataCache, setUserDataCache] = useState<{
    myRaces?: { data: any[]; timestamp: number };
    userCreatedRaces?: { data: any[]; timestamp: number };
  }>({});
  const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
  const USER_DATA_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for user data

  // Optimized data loading with caching
  const loadUserCreatedRaces = useCallback(
    async (force = false) => {
      if (!user) return;

      // Check cache first unless forced
      const cached = userDataCache.userCreatedRaces;
      const now = Date.now();
      if (
        !force &&
        cached &&
        now - cached.timestamp < USER_DATA_CACHE_DURATION
      ) {
        setUserCreatedRaces(cached.data);
        return;
      }

      try {
        const { data, error } = await dbHelpers.userRaces.getAll();
        const raceData = data || [];

        if (error) {
          console.error("Error loading user-created races:", error);
          setUserCreatedRaces([]);
        } else {
          // Add source identifier to user-created races
          const racesWithSource = raceData.map((race) => ({
            ...race,
            source: "user_created",
          }));
          setUserCreatedRaces(racesWithSource);

          // CRITICAL FIX: Remove any user-created races from myRaces to prevent duplication
          const userCreatedIds = racesWithSource.map((race) => race.id);
          setMyRaces((prev) => {
            const filtered = prev.filter((race) => {
              // Remove if it matches a user-created race ID
              if (userCreatedIds.includes(race.id)) return false;
              // Remove if it looks like a user-created race (no external identifiers)
              if (
                !race.externalRaceId &&
                !race.race_id &&
                (!race.registration_url || race.registration_url === "#")
              )
                return false;
              return true;
            });
            console.log(
              "🧹 DEDUPLICATION: Removed",
              prev.length - filtered.length,
              "user-created races from myRaces",
            );
            console.log(
              "🧹 DEDUPLICATION: myRaces before:",
              prev.length,
              "after:",
              filtered.length,
            );
            return filtered;
          });

          // Update cache
          setUserDataCache((prev) => ({
            ...prev,
            userCreatedRaces: { data: racesWithSource, timestamp: now },
          }));
        }
      } catch (error) {
        console.error("Error loading user-created races:", error);
        setUserCreatedRaces([]);
      }
    },
    [user, userDataCache.userCreatedRaces],
  );

  const loadMyRaces = useCallback(
    async (force = false) => {
      if (!user) return;

      // Check cache first unless forced
      const cached = userDataCache.myRaces;
      const now = Date.now();
      if (
        !force &&
        cached &&
        now - cached.timestamp < USER_DATA_CACHE_DURATION
      ) {
        setMyRaces(cached.data);
        return;
      }

      try {
        const { data, error } = await dbHelpers.userPlannedRaces.getAll();

        if (error) {
          if (error.code === "FEATURE_DISABLED") {
            // Handle gracefully
          } else {
            console.error("Error loading planned races:", error);
          }
          return;
        }

        // Transform database data to component format (optimized)
        const transformedRaces = (data || []).map((plannedRace) => {
          const externalRace = plannedRace.external_races;
          return {
            id: plannedRace.id,
            externalRaceId: externalRace?.id,
            name: externalRace?.name || plannedRace.race_name || "Unknown Race",
            location:
              externalRace?.location ||
              plannedRace.race_location ||
              "Location TBD",
            date:
              externalRace?.date ||
              plannedRace.race_date ||
              new Date().toISOString(),
            // CRITICAL FIX: Prioritize user's distance choice over external race default
            distance_type:
              plannedRace.distance_type ||
              externalRace?.distance_type ||
              "triathlon",
            status: plannedRace.status || "interested",
            description:
              externalRace?.description || plannedRace.description || "",
            source: "Saved Race",
            difficulty_score: externalRace?.difficulty_score,
            swim_type: externalRace?.swim_type,
            bike_elevation_gain: externalRace?.bike_elevation_gain,
            wetsuit_legal: externalRace?.wetsuit_legal,
            registration_url:
              externalRace?.registration_url || externalRace?.website,
            // CRITICAL FIX: Include custom distance fields from database
            user_swim_distance: plannedRace.user_swim_distance,
            user_bike_distance: plannedRace.user_bike_distance,
            user_run_distance: plannedRace.user_run_distance,
            notes: plannedRace.notes,
          };
        });

        // CRITICAL FIX: Filter out any user-created races to prevent duplication
        // Also check for races that lack external identifiers (likely user-created)
        const userCreatedIds = userCreatedRaces.map((race) => race.id);
        const filteredRaces = transformedRaces.filter((race) => {
          // Remove if it's in userCreatedRaces array
          if (userCreatedIds.includes(race.id)) return false;
          // Remove if it looks like a user-created race (no external IDs)
          if (
            !race.externalRaceId &&
            !race.race_id &&
            (!race.registration_url || race.registration_url === "#")
          )
            return false;
          return true;
        });
        console.log(
          "🧹 DEDUPLICATION: Filtered out",
          transformedRaces.length - filteredRaces.length,
          "user-created races from myRaces",
        );
        console.log(
          "🧹 DEDUPLICATION: Original count:",
          transformedRaces.length,
          "Filtered count:",
          filteredRaces.length,
        );

        setMyRaces(filteredRaces);
        setSavedRaces(filteredRaces.map((race) => race.id));

        // Update cache with filtered data
        setUserDataCache((prev) => ({
          ...prev,
          myRaces: { data: filteredRaces, timestamp: now },
        }));

        // Also backup to localStorage for consistency
        try {
          const localRacesKey = `saved_races_${user.id}`;
          localStorage.setItem(localRacesKey, JSON.stringify(transformedRaces));
        } catch (localError) {
          console.warn(
            "Error backing up database races to localStorage:",
            localError,
          );
        }
      } catch (error) {
        console.error("Error loading my races:", error);
        setMyRaces([]);
        setSavedRaces([]);
      }
    },
    [user, userDataCache.myRaces],
  );

  const initializeData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load data in parallel for better performance
      await Promise.all([
        loadMyRaces(),
        loadUserCreatedRaces(),
        // Don't auto-load discovered races - let user search
      ]);
    } catch (error) {
      console.error("Error initializing races data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, loadMyRaces, loadUserCreatedRaces]);

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
      ...userCreatedRaces.map((race) => ({ ...race, source: "user_created" })),
      ...myRaces.map((race) => ({ ...race, source: "saved" })),
    ];

    // Remove duplicates and sort by date
    const uniqueRaces = combinedRaces.filter(
      (race, index, arr) =>
        arr.findIndex((r) => r.id === race.id && r.source === race.source) ===
        index,
    );

    return uniqueRaces.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };

  // Helper function to generate cache key from search parameters
  const generateCacheKey = (
    locationQuery: string,
    searchRadius: string,
    raceDistance: string,
  ) => {
    return `${locationQuery.trim()}_${searchRadius}_${raceDistance}`;
  };

  const discoverRaces = async () => {
    if (isSyncing) return;

    // Check cache first
    const cacheKey = generateCacheKey(
      locationQuery,
      searchRadius,
      raceDistance,
    );
    const cached = raceCache[cacheKey];
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
      // Using cached race data (debug log removed)
      setDiscoveredRaces(cached.data);
      return;
    }

    setIsSyncing(true);
    try {
      // Discovering races from RunSignup API (debug log removed)

      // Search for races in the next 12 months (more inclusive date range)
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      const params = new URLSearchParams({
        results_per_page: "100",
        start_date: today.toISOString().split("T")[0],
        end_date: oneYearFromNow.toISOString().split("T")[0],
        event_type: "triathlon",
        sort: "date ASC",
      });

      if (locationQuery.trim()) {
        const location = locationQuery.trim();
        // Check if location looks like a zip code (5 digits)
        if (/^\d{5}$/.test(location)) {
          params.append("zipcode", location);
          console.log(`Using zip code directly: ${location}`);
        } else {
          // For city/state locations, geocode to get a central zip code
          // This allows the radius parameter to work properly
          // (radius only works with zip codes, not city names)

          let useZipCodeForRadius = false;
          let zipCodeToUse = "";

          // Try geocoding to get a central zip code for radius-based search
          try {
            const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
              console.error('[RACE DISCOVERY] Google Maps API key is not set! Cannot geocode.');
            } else {
              console.log(`[RACE DISCOVERY] Attempting to geocode "${location}"...`);
              const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
              const geoResponse = await fetch(geocodeUrl);

              console.log(`[RACE DISCOVERY] Geocoding response status: ${geoResponse.status}`);

              if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                console.log('[RACE DISCOVERY] Geocoding response:', geoData);

                if (geoData.status !== 'OK') {
                  console.error(`[RACE DISCOVERY] Geocoding API returned status: ${geoData.status}`);
                }

                if (geoData.results && geoData.results.length > 0) {
                  // Extract zip code from geocoding results
                  const addressComponents = geoData.results[0].address_components;
                  const zipComponent = addressComponents.find((comp: any) =>
                    comp.types.includes("postal_code"),
                  );

                  if (zipComponent) {
                    zipCodeToUse = zipComponent.short_name;
                    useZipCodeForRadius = true;
                    console.log(
                      `[RACE DISCOVERY] ✓ Geocoded "${location}" to zip code ${zipCodeToUse} for radius-based search`,
                    );
                  } else {
                    // No zip code in direct geocoding result (common for city names)
                    // Try reverse geocoding using the lat/long to get a specific address
                    console.log(`[RACE DISCOVERY] No zip code in city result, trying reverse geocode...`);

                    const geometry = geoData.results[0].geometry;
                    if (geometry && geometry.location) {
                      const lat = geometry.location.lat;
                      const lng = geometry.location.lng;
                      console.log(`[RACE DISCOVERY] Using coordinates: ${lat}, ${lng}`);

                      try {
                        const reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
                        const reverseResponse = await fetch(reverseUrl);

                        if (reverseResponse.ok) {
                          const reverseData = await reverseResponse.json();

                          if (reverseData.results && reverseData.results.length > 0) {
                            // Look through results for one with a postal code
                            for (const result of reverseData.results) {
                              const reverseComponents = result.address_components;
                              const reverseZip = reverseComponents.find((comp: any) =>
                                comp.types.includes("postal_code"),
                              );

                              if (reverseZip) {
                                zipCodeToUse = reverseZip.short_name;
                                useZipCodeForRadius = true;
                                console.log(
                                  `[RACE DISCOVERY] ✓ Reverse geocoded to zip code ${zipCodeToUse}`,
                                );
                                break;
                              }
                            }
                          }
                        }
                      } catch (reverseError) {
                        console.error('[RACE DISCOVERY] Reverse geocoding failed:', reverseError);
                      }
                    }

                    if (!useZipCodeForRadius) {
                      console.warn(`[RACE DISCOVERY] Could not get zip code for "${location}" via reverse geocoding`);
                    }
                  }
                } else {
                  console.warn(`[RACE DISCOVERY] No results from geocoding API for "${location}"`);
                }
              } else {
                const errorText = await geoResponse.text();
                console.error(`[RACE DISCOVERY] Geocoding request failed:`, errorText);
              }
            }
          } catch (geocodeError) {
            console.error(
              "[RACE DISCOVERY] Geocoding exception:",
              geocodeError,
            );
          }

          // If we got a zip code, use it with radius for best results
          if (useZipCodeForRadius && zipCodeToUse) {
            params.append("zipcode", zipCodeToUse);
            console.log(`Using zip code ${zipCodeToUse} with ${searchRadius}mi radius to cover entire metro area`);
          } else {
            // Fall back to city/state parsing if geocoding failed
            // First try to match "City, ST" (2-letter abbreviation)
            const cityStateMatch = location.match(/^(.+),\s*([A-Z]{2})$/i);
            if (cityStateMatch) {
              // Format: "City, ST"
              const city = cityStateMatch[1].trim();
              const state = cityStateMatch[2].trim().toUpperCase();
              params.append("city", city);
              params.append("state", state);
              console.log(`Using city/state: ${city}, ${state} (radius may not work without zip code)`);
            } else {
              // Try to match "City, StateName" (full state name)
              const cityFullStateMatch = location.match(/^(.+),\s*(.+)$/i);
              if (cityFullStateMatch) {
                const cityName = cityFullStateMatch[1].trim();
                const statePart = cityFullStateMatch[2].trim();
                const stateAbbrev = getStateAbbreviation(statePart);

                // Only use this format if we successfully converted a known state name
                if (
                  stateAbbrev !== statePart.toUpperCase() ||
                  statePart.length === 2
                ) {
                  params.append("city", cityName);
                  params.append("state", stateAbbrev);
                  console.log(`Using city/state: ${cityName}, ${stateAbbrev} (radius may not work without zip code)`);
                } else {
                  // If state conversion failed, treat the whole thing as a city search
                  params.append("city", location);
                  console.log(`Using city only: ${location} (radius may not work without zip code)`);
                }
              } else if (location.match(/^[A-Z]{2}$/i)) {
                // Just a state abbreviation
                const state = location.toUpperCase();
                params.append("state", state);
                console.log(`Using state only: ${state}`);
              } else {
                // Check if it's just a full state name
                const stateAbbrev = getStateAbbreviation(location);
                if (stateAbbrev !== location.toUpperCase()) {
                  // It was a recognized state name
                  params.append("state", stateAbbrev);
                  console.log(`Using state only: ${stateAbbrev}`);
                } else {
                  // City name only
                  params.append("city", location);
                  console.log(`Using city only: ${location} (radius may not work without zip code)`);
                }
              }
            }
          }
        }
      }

      if (searchRadius && searchRadius !== "all") {
        params.append("radius", searchRadius);
      }

      const apiBaseUrl =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
      const requestUrl = `${apiBaseUrl}/runsignup/search?${params.toString()}`;

      console.log(`[RACE DISCOVERY] Searching with params:`, {
        location: locationQuery,
        radius: searchRadius,
        dateRange: `${params.get('start_date')} to ${params.get('end_date')}`,
        fullUrl: requestUrl
      });

      const response = await fetch(requestUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[RACE DISCOVERY] API error response:", errorText);
        console.error("[RACE DISCOVERY] Request failed with status:", response.status);

        // If external API is not available, provide sample races for demo
        console.warn("External race API not available, using sample data");
        const sampleRaces = [
          {
            id: "sample-1",
            name: "Atlanta Sprint Triathlon 2025",
            location: "Atlanta, GA",
            date: "2025-06-15",
            distance_type: "sprint",
            description:
              "A beautiful lake course perfect for beginners and experienced athletes",
            registration_url: "https://example.com/register",
            source: "Sample Data",
          },
          {
            id: "sample-2",
            name: "Chattanooga Olympic Triathlon 2025",
            location: "Chattanooga, TN",
            date: "2025-09-22",
            distance_type: "olympic",
            description:
              "Challenging bike course with rolling hills and scenic views",
            registration_url: "https://example.com/register",
            source: "Sample Data",
          },
          {
            id: "sample-3",
            name: "Blue Ridge 70.3 Triathlon 2025",
            location: "Asheville, NC",
            date: "2025-08-10",
            distance_type: "70.3",
            description:
              "Half-distance triathlon in the beautiful Blue Ridge Mountains",
            registration_url: "https://example.com/register",
            source: "Sample Data",
          },
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
        console.error("[RACE DISCOVERY] JSON parse error:", parseError);
        console.error(
          "[RACE DISCOVERY] Response was not valid JSON, full text:",
          responseText,
        );
        throw parseError;
      }

      if (data.races && data.races.length > 0) {
        const transformedRaces = data.races.map((raceWrapper, index) => {
          const race = raceWrapper.race || raceWrapper;
          const stripHtml = (html) =>
            html
              ? html
                  .replace(/<[^>]*>/g, "")
                  .replace(/&nbsp;/g, " ")
                  .trim()
              : "";

          // Determine specific distance instead of generic "triathlon"
          const specificDistance = determineRaceDistance(race);

          return {
            id: race.race_id || `discovered-${Date.now()}-${index}`,
            name: race.name || "Unnamed Race",
            location: race.address
              ? `${race.address.city || ""}, ${race.address.state || ""}`
              : "Location TBD",
            date: race.next_date || race.last_date || new Date().toISOString(),
            distance_type: specificDistance,
            description: stripHtml(race.description) || "Triathlon race",
            website: race.url || "#",
            registration_url: race.url || "#",
            source: "RunSignup",
            status: "discovered",
            price_min: race.price_min,
            currency: race.currency,
            is_sold_out: race.is_sold_out,
            spots_available: race.spots_available,
          };
        });

        setDiscoveredRaces(transformedRaces);

        // Cache the results
        setRaceCache((prev) => ({
          ...prev,
          [cacheKey]: {
            data: transformedRaces,
            timestamp: now,
          },
        }));

        console.log(`[RACE DISCOVERY] Found ${transformedRaces.length} races`);
      } else {
        console.warn(`[RACE DISCOVERY] No races found for location: ${locationQuery}, radius: ${searchRadius}mi`);
        console.warn(`[RACE DISCOVERY] Try expanding search radius or checking a different location`);
        setDiscoveredRaces([]);
      }
    } catch (error) {
      console.warn(
        "Error discovering races from external API, using sample data:",
        error,
      );
      // Provide sample races as fallback when external API fails
      const sampleRaces = [
        {
          id: "sample-1",
          name: "Atlanta Sprint Triathlon 2025",
          location: "Atlanta, GA",
          date: "2025-06-15",
          distance_type: "sprint",
          description:
            "A beautiful lake course perfect for beginners and experienced athletes",
          registration_url: "https://example.com/register",
          source: "Sample Data",
        },
        {
          id: "sample-2",
          name: "Chattanooga Olympic Triathlon 2025",
          location: "Chattanooga, TN",
          date: "2025-09-22",
          distance_type: "olympic",
          description:
            "Challenging bike course with rolling hills and scenic views",
          registration_url: "https://example.com/register",
          source: "Sample Data",
        },
        {
          id: "sample-3",
          name: "Blue Ridge 70.3 Triathlon 2025",
          location: "Asheville, NC",
          date: "2025-08-10",
          distance_type: "70.3",
          description:
            "Half-distance triathlon in the beautiful Blue Ridge Mountains",
          registration_url: "https://example.com/register",
          source: "Sample Data",
        },
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
    const isAlreadySaved = myRaces.some(
      (savedRace) =>
        savedRace.externalRaceId === race.id ||
        (savedRace.name === race.name && savedRace.date === race.date),
    );

    if (isAlreadySaved) {
      alert("This race is already saved!");
      return;
    }

    try {
      setSavingRaces((prev) => [...prev, race.id]);

      // Try to save to database first - need to create external race first, then planned race

      // Step 1: Create external race entry (only with fields that exist in the table)
      const externalRaceData = {
        external_id: race.id, // The original race ID from the external source
        api_source: race.source || "unknown",
        name: race.name,
        date: race.date,
        location: race.location,
        city: race.city || "",
        state: race.state || "",
        country: race.country || "US",
        ...(race.latitude && { latitude: race.latitude }),
        ...(race.longitude && { longitude: race.longitude }),
        distance_type: ["sprint", "olympic", "70.3", "ironman"].includes(
          race.distance_type,
        )
          ? race.distance_type
          : "other",
        ...(race.difficulty &&
          ["beginner", "intermediate", "advanced", "expert"].includes(
            race.difficulty,
          ) && { difficulty: race.difficulty }),
        ...(race.registration_url && {
          registration_url: race.registration_url,
        }),
        ...(race.website &&
          !race.registration_url && { registration_url: race.website }),
        ...(race.price_min && { price_min: race.price_min }),
        ...(race.price_max && { price_max: race.price_max }),
        currency: race.currency || "USD",
        ...(race.spots_available && { spots_available: race.spots_available }),
        ...(race.spots_total && { spots_total: race.spots_total }),
        is_sold_out: race.is_sold_out || false,
        description: race.description || "",
        ...(race.features && { features: JSON.stringify(race.features) }),

        // Triathlon-specific fields
        ...(race.swim_type &&
          ["pool", "open_water", "river", "lake", "ocean"].includes(
            race.swim_type,
          ) && { swim_type: race.swim_type }),
        ...(race.swim_distance_meters && {
          swim_distance_meters: race.swim_distance_meters,
        }),
        ...(race.bike_distance_meters && {
          bike_distance_meters: race.bike_distance_meters,
        }),
        ...(race.bike_elevation_gain && {
          bike_elevation_gain: race.bike_elevation_gain,
        }),
        ...(race.run_distance_meters && {
          run_distance_meters: race.run_distance_meters,
        }),
        ...(race.wetsuit_legal !== undefined && {
          wetsuit_legal: race.wetsuit_legal,
        }),
        ...(race.transition_area && { transition_area: race.transition_area }),
        ...(race.course_description && {
          course_description: race.course_description,
        }),
        ...(race.difficulty_score &&
          race.difficulty_score >= 1 &&
          race.difficulty_score <= 10 && {
            difficulty_score: race.difficulty_score,
          }),
        ...(race.wave_start !== undefined && { wave_start: race.wave_start }),
        ...(race.qualifying_race !== undefined && {
          qualifying_race: race.qualifying_race,
        }),
        ...(race.age_group_categories && {
          age_group_categories: JSON.stringify(race.age_group_categories),
        }),
        ...(race.awards_info && { awards_info: race.awards_info }),
        ...(race.course_records && {
          course_records: JSON.stringify(race.course_records),
        }),
        ...(race.weather_conditions && {
          weather_conditions: race.weather_conditions,
        }),
        ...(race.water_temperature_avg && {
          water_temperature_avg: race.water_temperature_avg,
        }),
        ...(race.draft_legal !== undefined && {
          draft_legal: race.draft_legal,
        }),
      };

      const { data: externalRace, error: externalError } =
        await dbHelpers.externalRaces.create(externalRaceData);

      if (externalError && !externalError.message?.includes("duplicate")) {
        console.warn("Failed to create external race:", externalError);
        throw externalError;
      }

      // If it's a duplicate, find the existing one
      let externalRaceId = externalRace?.id;
      if (externalError?.message?.includes("duplicate")) {
        // Try to find existing external race by external_id
        const { data: existingRaces } = await dbHelpers.externalRaces.getAll();
        const existingRace = existingRaces?.find(
          (r) => r.external_id === race.id,
        );
        externalRaceId = existingRace?.id;
      }

      if (!externalRaceId) {
        throw new Error("Failed to get external race ID");
      }

      // Step 2: Create user planned race entry
      const plannedRaceData = {
        external_race_id: externalRaceId,
        status: "interested",
      };

      const { data: _, error } =
        await dbHelpers.userPlannedRaces.create(plannedRaceData);

      if (error) {
        console.warn(
          "Database save failed, using local state and localStorage:",
          error,
        );
        // Fallback to local state and localStorage
        const localSavedRace = {
          ...race,
          id: `local-${Date.now()}`,
          externalRaceId: race.id,
          status: "interested",
          saved_at: new Date().toISOString(),
        };

        const updatedRaces = [...myRaces, localSavedRace];
        setMyRaces(updatedRaces);
        setSavedRaces((prev) => [...prev, race.id]);

        // Save to localStorage as backup
        try {
          const localRacesKey = `saved_races_${user.id}`;
          localStorage.setItem(localRacesKey, JSON.stringify(updatedRaces));
          // Race saved to localStorage as backup (debug log removed)
        } catch (localError) {
          console.warn("Error saving to localStorage:", localError);
        }
      } else {
        // Race saved to database (debug log removed)
        // Refresh the races list to get the updated data from the database
        await loadMyRaces();
      }

      // Show success feedback
      alert(`"${race.name}" has been saved to your races!`);
    } catch (error) {
      console.error("Error saving race:", error);
      alert("Failed to save race. Please try again.");
    } finally {
      setSavingRaces((prev) => prev.filter((id) => id !== race.id));
    }
  };

  const unsaveRace = async (raceId: string) => {
    if (!user) return;

    try {
      setSavingRaces((prev) => [...prev, raceId]);

      // Find the race to remove by external ID or internal ID
      const raceToRemove = myRaces.find(
        (race) => race.externalRaceId === raceId || race.id === raceId,
      );

      if (raceToRemove) {
        // Try to remove from database first
        try {
          const { error } = await dbHelpers.userPlannedRaces.delete(
            raceToRemove.id,
          );
          if (error) {
            console.warn(
              "Database delete failed, removing from local state only:",
              error,
            );
          }
          // Race removed from database (debug log removed)
        } catch (dbError) {
          console.warn(
            "Database delete error, proceeding with local removal:",
            dbError,
          );
        }

        // Always remove from local state (for both database and local-only races)
        const updatedRaces = myRaces.filter(
          (race) => race.externalRaceId !== raceId && race.id !== raceId,
        );
        setMyRaces(updatedRaces);
        setSavedRaces((prev) => prev.filter((id) => id !== raceId));

        // Update localStorage as backup
        try {
          const localRacesKey = `saved_races_${user.id}`;
          localStorage.setItem(localRacesKey, JSON.stringify(updatedRaces));
          // Race removed from localStorage backup (debug log removed)
        } catch (localError) {
          console.warn("Error updating localStorage:", localError);
        }

        alert(`"${raceToRemove.name}" has been removed from your saved races.`);
        // Race removed from saved races (debug log removed)

        // Refresh data to stay in sync with database
        await loadMyRaces();
      }
    } catch (error) {
      console.error("Error removing race:", error);
      alert("Failed to remove race. Please try again.");
    } finally {
      setSavingRaces((prev) => prev.filter((id) => id !== raceId));
    }
  };

  const updateRaceStatus = async (
    raceId: string,
    newStatus: "interested" | "registered" | "completed",
  ) => {
    console.log("🔥 NEW UPDATE FUNCTION LOADED - VERSION 2.0");
    if (!user) return;

    try {
      // Find the race to determine if it's user-created or external
      const race = [...myRaces, ...userCreatedRaces].find(
        (r) => r.id === raceId,
      );
      console.log("DEBUG: Race found for status update:", race);
      console.log("DEBUG: Race ID being updated:", raceId);
      console.log("DEBUG: New status:", newStatus);

      if (!race) {
        alert("Race not found.");
        return;
      }

      // Store original status for rollback
      const originalStatus = race.status;
      // Check if this race is in the userCreatedRaces array (more reliable than checking source field)
      const isUserCreated =
        userCreatedRaces.some((ur) => ur.id === raceId) ||
        race.source === "user_created";

      console.log("DEBUG: Is user created race:", isUserCreated);
      console.log("DEBUG: Original status:", originalStatus);

      // Enhanced debugging to track state arrays
      console.log("🔍 BEFORE UPDATE - Array contents:");
      console.log(
        "🔍 userCreatedRaces contains target race:",
        userCreatedRaces.some((r) => r.id === raceId),
      );
      console.log(
        "🔍 myRaces contains target race:",
        myRaces.some((r) => r.id === raceId),
      );
      console.log(
        "🔍 Target race current status in userCreated:",
        userCreatedRaces.find((r) => r.id === raceId)?.status,
      );
      console.log(
        "🔍 Target race current status in myRaces:",
        myRaces.find((r) => r.id === raceId)?.status,
      );

      // Update local state immediately for responsiveness
      // ROBUST FIX: Update BOTH arrays to handle any remaining duplication edge cases
      console.log("🎯 Updating state arrays...");

      if (isUserCreated) {
        console.log("🎯 Primary update: userCreatedRaces array...");
        setUserCreatedRaces((prev) =>
          prev.map((race) =>
            race.id === raceId ? { ...race, status: newStatus } : race,
          ),
        );
        // Also update myRaces as a safety net in case of duplication
        setMyRaces((prev) =>
          prev.map((race) =>
            race.id === raceId ? { ...race, status: newStatus } : race,
          ),
        );
      } else {
        console.log("🎯 Primary update: myRaces array...");
        setMyRaces((prev) =>
          prev.map((race) =>
            race.id === raceId ? { ...race, status: newStatus } : race,
          ),
        );
        // Also update userCreatedRaces as a safety net in case of duplication
        setUserCreatedRaces((prev) =>
          prev.map((race) =>
            race.id === raceId ? { ...race, status: newStatus } : race,
          ),
        );
      }

      // Save to database using the appropriate helper
      console.log("DEBUG: About to call database update...");
      const { error } = isUserCreated
        ? await dbHelpers.userRaces.updateStatus(raceId, newStatus)
        : await dbHelpers.userPlannedRaces.updateStatus(raceId, newStatus);

      console.log("DEBUG: Database update result - error:", error);

      if (error) {
        console.error("Error updating race status in database:", error);
        // Revert local state to original status if database update fails
        if (isUserCreated) {
          setUserCreatedRaces((prev) =>
            prev.map((race) =>
              race.id === raceId ? { ...race, status: originalStatus } : race,
            ),
          );
        } else {
          setMyRaces((prev) =>
            prev.map((race) =>
              race.id === raceId ? { ...race, status: originalStatus } : race,
            ),
          );
        }
        alert("Failed to update race status. Please try again.");
        return;
      }

      // Also update localStorage as backup
      try {
        const localRacesKey = `saved_races_${user.id}`;
        if (!isUserCreated) {
          const updatedRaces = myRaces.map((race) =>
            race.id === raceId ? { ...race, status: newStatus } : race,
          );
          localStorage.setItem(localRacesKey, JSON.stringify(updatedRaces));
        }
      } catch (localError) {
        console.warn("Error updating localStorage:", localError);
      }

      // Race status updated successfully - update state directly
      console.log("🎉 SUCCESS: Database update completed successfully!");
      console.log("🔄 Updating local state directly...");

      // FORCE RE-RENDER: Trigger React to re-render all components
      console.log("🔄 Forcing React re-render to update UI...");
      setRenderKey((prev) => prev + 1);

      // Force fresh state updates to ensure React detects the change
      setTimeout(() => {
        console.log("🔄 Secondary force update to ensure UI refresh...");
        if (isUserCreated) {
          setUserCreatedRaces((prev) => [
            ...prev.map((race) =>
              race.id === raceId
                ? { ...race, status: newStatus, _lastUpdated: Date.now() }
                : race,
            ),
          ]);
        } else {
          setMyRaces((prev) => [
            ...prev.map((race) =>
              race.id === raceId
                ? { ...race, status: newStatus, _lastUpdated: Date.now() }
                : race,
            ),
          ]);
        }
        // Force another render
        setRenderKey((prev) => prev + 1);
      }, 50);

      console.log("✅ Local state should now reflect the change");

      // Also show user feedback
      console.log(
        `📢 User should see status change from "${originalStatus}" to "${newStatus}"`,
      );

      // Let's see what the state looks like after update
      setTimeout(() => {
        const updatedRace = [...myRaces, ...userCreatedRaces].find(
          (r) => r.id === raceId,
        );
        console.log("🔍 Race state after update:", updatedRace?.status);

        // If the state still shows old status, force update it
        if (updatedRace && updatedRace.status !== newStatus) {
          console.log("⚠️ State not updated correctly, forcing update...");
          if (isUserCreated) {
            setUserCreatedRaces((prev) =>
              prev.map((race) =>
                race.id === raceId ? { ...race, status: newStatus } : race,
              ),
            );
          } else {
            setMyRaces((prev) =>
              prev.map((race) =>
                race.id === raceId ? { ...race, status: newStatus } : race,
              ),
            );
          }
          console.log("🔧 Force-updated race state to:", newStatus);
        }
      }, 1000);
    } catch (error) {
      console.error("Error updating race status:", error);
      alert("Failed to update race status. Please try again.");
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
    console.log(
      "🔄 handleRaceUpdate called - selectively reloading for distance updates",
    );
    console.log(
      "⏸️ Will reload data to pick up distance changes but preserve status updates",
    );

    // Clear cache to force fresh data fetch for distance updates
    setUserDataCache({});

    // Reload data with a delay to allow database changes to settle
    setTimeout(() => {
      console.log("🔄 Reloading race data to pick up distance updates...");
      loadMyRaces(true); // Force reload to get latest distance data for imported races
      loadUserCreatedRaces(true); // Force reload user races too (CRITICAL FIX)
    }, 1000);

    console.log("✅ handleRaceUpdate will reload data for distance updates");
  };

  // Race result handler
  const handleAddRaceResult = async (resultData: any) => {
    if (!user) {
      alert("Please sign in to add race results");
      return;
    }

    try {
      // Add user_id to the result data
      const raceResultWithUser = {
        ...resultData,
        user_id: user.id,
      };

      const { data: _, error } =
        await dbHelpers.raceResults.add(raceResultWithUser);

      if (error) {
        console.error("Error adding race result:", error);
        alert("Failed to save race result. Please try again.");
        return;
      }

      alert("Race result added successfully!");
      setShowAddResultModal(false);

      // Optionally reload race data to show updated information
      loadMyRaces();
      loadUserCreatedRaces();
    } catch (error) {
      console.error("Error adding race result:", error);
      alert("Failed to save race result. Please try again.");
    }
  };

  // Filter functions
  const filterRaces = (races: any[], query: string = searchQuery) => {
    if (!query) return races;

    return races.filter(
      (race) =>
        race.name?.toLowerCase().includes(query.toLowerCase()) ||
        race.location?.toLowerCase().includes(query.toLowerCase()) ||
        race.distance_type?.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const filterByDistance = (races: any[]) => {
    if (raceDistance === "all") return races;
    return races.filter((race) =>
      race.distance_type?.toLowerCase().includes(raceDistance.toLowerCase()),
    );
  };

  const getUpcomingRaces = () => {
    // Combine both saved external races and user-created races
    const allRaces = [
      ...myRaces,
      ...userCreatedRaces.map((race) => ({ ...race, source: "user_created" })), // CRITICAL FIX: Don't override status
    ];

    const upcoming = allRaces.filter((race) => {
      const raceDate = new Date(race.date);
      return raceDate >= new Date() && race.status !== "completed";
    });
    return filterByDistance(filterRaces(upcoming));
  };

  const getPastRaces = () => {
    // Combine both saved external races and user-created races
    const allRaces = [
      ...myRaces,
      ...userCreatedRaces.map((race) => ({ ...race, source: "user_created" })), // CRITICAL FIX: Don't override status
    ];

    const past = allRaces.filter((race) => {
      const raceDate = new Date(race.date);
      return raceDate < new Date() || race.status === "completed";
    });
    return filterByDistance(filterRaces(past));
  };

  const getFilteredDiscoveredRaces = () => {
    return filterByDistance(filterRaces(discoveredRaces));
  };

  const renderRaceCard = (race: any, showSaveButton: boolean = true) => (
    <div
      key={`${race.id}-${race.status}-${race._lastUpdated}-${renderKey}`}
      className="bg-terminal-panel border-2 border-terminal-border p-4 sm:p-6 hover:border-accent-yellow transition-colors w-full max-w-full overflow-hidden"
      style={{ borderRadius: 0 }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1 truncate font-mono tracking-wider uppercase">
            {race.name}
          </h3>
          <p className="text-accent-yellow font-medium font-mono">
            {new Date(race.date).toLocaleDateString()}
          </p>
          <p className="text-text-secondary text-sm break-words font-mono">
            {race.location}
          </p>
          {race.source && (
            <p className="text-text-secondary text-xs mt-1 font-mono uppercase">
              Source: {race.source}
            </p>
          )}
        </div>
        <div className="flex sm:flex-col items-start sm:items-end gap-2">
          <span
            className="bg-accent-yellow text-terminal-bg px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold uppercase whitespace-nowrap font-mono"
            style={{ borderRadius: 0 }}
          >
            {race.distance_type}
          </span>
          {race.status && !showSaveButton && (
            <div className="relative">
              <select
                value={race.status}
                onChange={(e) =>
                  updateRaceStatus(
                    race.id,
                    e.target.value as "interested" | "registered" | "completed",
                  )
                }
                className={`px-3 py-1 text-xs sm:text-sm font-bold font-mono uppercase border-2 cursor-pointer ${
                  race.status === "registered"
                    ? "bg-[#4ECDC4]/20 text-[#4ECDC4] border-[#4ECDC4]"
                    : race.status === "completed"
                      ? "bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]"
                      : "bg-accent-yellow/20 text-accent-yellow border-accent-yellow"
                }`}
                style={{ borderRadius: 0 }}
              >
                <option value="interested">INTERESTED</option>
                <option value="registered">REGISTERED</option>
                <option value="completed">COMPLETE</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {race.description && (
        <p className="text-text-secondary mb-4 text-sm line-clamp-2 break-words font-mono">
          {race.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {race.price_min && (
          <div>
            <span className="text-white/60 text-xs">Entry Fee:</span>
            <div className="text-green-400 font-bold">
              {race.currency === "EUR" ? "€" : "$"}
              {race.price_min}
            </div>
          </div>
        )}
        {race.difficulty_score && (
          <div>
            <span className="text-white/60 text-xs">Difficulty:</span>
            <div className="text-white font-medium">
              {race.difficulty_score}/10
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Action buttons row */}
        <div className="grid grid-cols-3 gap-2">
          {showSaveButton && user && (
            <>
              <button
                className={`py-2 transition-colors text-xs sm:text-sm font-bold font-mono uppercase flex items-center justify-center gap-1 border-2 ${
                  savedRaces.includes(race.id)
                    ? "bg-[#4ECDC4]/20 text-[#4ECDC4] border-[#4ECDC4] hover:bg-[#4ECDC4]/30"
                    : "bg-accent-yellow text-terminal-bg border-accent-yellow hover:bg-accent-yellow/90"
                }`}
                style={{ borderRadius: 0 }}
                onClick={() =>
                  savedRaces.includes(race.id)
                    ? unsaveRace(race.id)
                    : saveRace(race)
                }
                disabled={savingRaces.includes(race.id)}
              >
                {savingRaces.includes(race.id) ? (
                  <span className="flex items-center justify-center gap-1">
                    <div
                      className="w-3 h-3 border-2 border-current border-t-transparent animate-spin"
                      style={{ borderRadius: 0 }}
                    ></div>
                    {savedRaces.includes(race.id) ? "REMOVING..." : "SAVING..."}
                  </span>
                ) : savedRaces.includes(race.id) ? (
                  <span className="flex items-center justify-center gap-1">
                    <TbTrash className="w-4 h-4" /> REMOVE
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <TbStar className="w-4 h-4" /> SAVE
                  </span>
                )}
              </button>
              <button
                className="py-2 bg-[#00D4FF]/20 text-[#00D4FF] border-2 border-[#00D4FF] hover:bg-[#00D4FF]/30 transition-colors text-xs sm:text-sm font-bold font-mono uppercase flex items-center justify-center gap-1"
                style={{ borderRadius: 0 }}
                onClick={() =>
                  race.registration_url &&
                  window.open(race.registration_url, "_blank")
                }
              >
                REGISTER
              </button>
              <div className="col-span-1"></div>
            </>
          )}

          {!showSaveButton && (
            <>
              {/* Update Race Details button */}
              <button
                className="py-2 bg-[#00D4FF]/20 text-[#00D4FF] border-2 border-[#00D4FF] hover:bg-[#00D4FF]/30 transition-colors text-xs sm:text-sm font-bold font-mono uppercase flex items-center justify-center gap-1"
                style={{ borderRadius: 0 }}
                onClick={() => openUpdateModal(race)}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  UPDATE
                </span>
              </button>

              {/* Planning button for saved races */}
              <button
                className="py-2 bg-[#FF6B35]/20 text-[#FF6B35] border-2 border-[#FF6B35] hover:bg-[#FF6B35]/30 transition-colors text-xs sm:text-sm font-bold font-mono uppercase flex items-center justify-center gap-1"
                style={{ borderRadius: 0 }}
                onClick={() => {
                  // Store the race data in localStorage for the Planning tab to access
                  localStorage.setItem(
                    "selectedRaceForPlanning",
                    JSON.stringify(race),
                  );
                  // Navigate to Planning tab
                  router.push("/planning");
                }}
              >
                <span className="flex items-center justify-center gap-1">
                  <TbClipboard className="w-4 h-4" /> PLAN RACE
                </span>
              </button>

              {/* Remove button for saved races */}
              <button
                className="py-2 bg-red-500/20 text-red-400 border-2 border-red-400 hover:bg-red-500/30 transition-colors text-xs sm:text-sm font-bold font-mono uppercase flex items-center justify-center gap-1"
                style={{ borderRadius: 0 }}
                onClick={() => unsaveRace(race.externalRaceId || race.id)}
                disabled={savingRaces.includes(race.externalRaceId || race.id)}
              >
                {savingRaces.includes(race.externalRaceId || race.id) ? (
                  <span className="flex items-center justify-center gap-1">
                    <div
                      className="w-3 h-3 border-2 border-current border-t-transparent animate-spin"
                      style={{ borderRadius: 0 }}
                    ></div>
                    REMOVING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <TbTrash className="w-4 h-4" /> REMOVE
                  </span>
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
      <div
        className="bg-terminal-bg relative overflow-auto"
        style={{ minHeight: "100vh", minHeight: "100dvh" }}
      >

        <div className="relative z-10 p-6 pb-24 w-full max-w-full overflow-hidden">
          {/* Header - Terminal Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b-2 border-terminal-border pb-4">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-text-primary font-mono tracking-wider mb-2">
                MY RACES
              </h1>
              <p className="text-sm text-text-secondary font-mono uppercase tracking-wide">
                DISCOVER, SAVE, AND MANAGE YOUR TRIATHLON RACES
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="SEARCH RACES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-terminal-panel border-2 border-terminal-border px-4 py-2 text-text-primary font-mono placeholder-text-secondary focus:outline-none focus:border-accent-yellow uppercase"
                style={{ borderRadius: 0 }}
              />
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              {
                id: "upcoming",
                label: "UPCOMING RACES",
                icon: "TbFlag",
                count: getUpcomingRaces().length,
              },
              {
                id: "past",
                label: "PAST RACES",
                icon: "TbTrophy",
                count: getPastRaces().length,
              },
              {
                id: "discover",
                label: "DISCOVER NEW RACES",
                icon: "TbSearch",
                count: getFilteredDiscoveredRaces().length,
              },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 font-mono text-sm ${
                  activeSection === section.id
                    ? "bg-terminal-panel text-accent-yellow border-2 border-accent-yellow"
                    : "bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary"
                }`}
                style={{ borderRadius: 0 }}
              >
                {renderIcon(section.icon, "w-5 h-5")}
                {section.label}
                {section.count > 0 && (
                  <span
                    className="bg-accent-yellow text-terminal-bg text-xs px-2 py-1 font-mono font-bold"
                    style={{ borderRadius: 0 }}
                  >
                    {section.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Discovery Search Controls */}
          {activeSection === "discover" && (
            <div
              className="bg-terminal-panel border-2 border-terminal-border p-6 mb-8"
              style={{ borderRadius: 0 }}
            >
              <h3 className="text-lg font-bold text-text-primary font-mono tracking-wider mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                RACE DISCOVERY
              </h3>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="CITY, STATE, OR ZIP CODE"
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    SEARCH RADIUS
                  </label>
                  <select
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-2 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                  >
                    <option value="all">NATIONWIDE</option>
                    <option value="25">25 MI</option>
                    <option value="50">50 MI</option>
                    <option value="100">100 MI</option>
                    <option value="250">250 MI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    DISTANCE FILTER
                  </label>
                  <select
                    value={raceDistance}
                    onChange={(e) => setRaceDistance(e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-2 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                  >
                    <option value="all">ALL DISTANCES</option>
                    <option value="sprint">SPRINT</option>
                    <option value="olympic">OLYMPIC</option>
                    <option value="70.3">70.3</option>
                    <option value="ironman">IRONMAN</option>
                  </select>
                </div>
              </div>

              <button
                onClick={discoverRaces}
                disabled={isSyncing}
                className="bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-colors flex items-center gap-2 font-mono text-xs font-bold tracking-wider disabled:opacity-50"
                style={{ borderRadius: 0 }}
              >
                {isSyncing ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-current border-t-transparent animate-spin"
                      style={{ borderRadius: 0 }}
                    ></div>
                    DISCOVERING RACES...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    DISCOVER RACES
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
            <div
              key={`race-grid-${renderKey}`}
              className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-full overflow-hidden"
            >
              {activeSection === "upcoming" && (
                <>
                  {getUpcomingRaces().length > 0 ? (
                    <>
                      {getUpcomingRaces().map((race) =>
                        renderRaceCard(race, false),
                      )}
                      {/* Add Create Race button at the end */}
                      <div className="col-span-full mt-6">
                        <UserRaceManagement onRaceUpdate={handleRaceUpdate} />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70 mb-4">
                        No upcoming races found.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => setActiveSection("discover")}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                        >
                          Discover Races
                        </button>
                        <div className="sm:w-auto">
                          <UserRaceManagement onRaceUpdate={handleRaceUpdate} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeSection === "past" && (
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
                    getPastRaces().map((race) => renderRaceCard(race, false))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70">No past races found.</p>
                    </div>
                  )}
                </>
              )}

              {activeSection === "discover" && (
                <>
                  {getFilteredDiscoveredRaces().length > 0 ? (
                    getFilteredDiscoveredRaces().map((race) =>
                      renderRaceCard(race, true),
                    )
                  ) : discoveredRaces.length === 0 && !isSyncing ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70 mb-4">
                        Click &quot;Discover Races&quot; to find triathlon races
                        in your area.
                      </p>
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-white/70">
                        No races match your current filters.
                      </p>
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
