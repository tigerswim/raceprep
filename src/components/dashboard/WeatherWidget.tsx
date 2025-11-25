import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import {
  TbSwimming,
  TbBike,
  TbRun
} from 'react-icons/tb';
import { useTerminalDesign } from '../../utils/featureFlags';
import { WeatherWidgetTerminal } from './WeatherWidget.terminal';

interface WeatherData {
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    conditions: string;
    description: string;
    visibility: number;
  };
  forecast: Array<{
    datetime: string;
    temperature: number;
    conditions: string;
    description: string;
    precipitation: number;
    wind_speed: number;
  }>;
  conditions: {
    overall: string;
    swim: string;
    bike: string;
    run: string;
    warnings: string[];
  };
}

export const WeatherWidget: React.FC = () => {
  // Check if terminal design is enabled for this widget
  const useTerminal = useTerminalDesign('weather');

  if (useTerminal) {
    return <WeatherWidgetTerminal />;
  }

  // Legacy implementation below
  const router = useRouter();
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<string>('Getting location...');
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    try {
      loadUserPreferences();
    } catch (err) {
      console.error('Error in loadUserPreferences:', err);
      setError('Failed to initialize weather widget');
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      // Only auto-locate on desktop browsers, not mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (!isMobile) {
        getCurrentLocation();
      } else {
        // For mobile, just set default location and let user choose to enable geolocation
        console.log('[WeatherWidget] Mobile device detected, using default location. User can tap locate button.');
        setCoordinates({ lat: 30.2672, lon: -97.7431 });
        setLocation('Austin, TX • Tap 📍 to use your location');
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (coordinates && !error) {
      loadWeatherData();
    }
  }, [coordinates, error]);

  const loadUserPreferences = async () => {
    try {
      if (user?.id) {
        const { data: profile, error } = await dbHelpers.users.getProfile(user.id);
        if (!error && profile) {
          setUserProfile(profile);
          setTemperatureUnit(profile.temperature_units || 'fahrenheit');
        } else {
          // Use default settings if no profile found
          setTemperatureUnit('fahrenheit');
          setUserProfile({ temperature_units: 'fahrenheit' });
        }
      } else {
        // Default for non-authenticated users
        setTemperatureUnit('fahrenheit');
        setUserProfile({ temperature_units: 'fahrenheit' });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setTemperatureUnit('fahrenheit');
      setUserProfile({ temperature_units: 'fahrenheit' });
    }
  };

  const getCurrentLocation = async () => {
    console.log('[WeatherWidget] Getting current location...');

    try {
      // Check if geolocation is available
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        console.log('[WeatherWidget] Geolocation not supported, using default location');
        setCoordinates({ lat: 30.2672, lon: -97.7431 });
        setLocation('Austin, TX (geolocation not supported)');
        return;
      }

      // Check if we're on HTTPS (required for mobile Safari)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('[WeatherWidget] Geolocation requires HTTPS on mobile devices');
        setCoordinates({ lat: 30.2672, lon: -97.7431 });
        setLocation('Austin, TX (HTTPS required)');
        return;
      }

      // Detect mobile Safari for specific handling
      const isMobileSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      setIsLoading(true);
      console.log('[WeatherWidget] Requesting geolocation permission...', { isMobileSafari, isMobile });

      // Use Promise wrapper for better mobile compatibility
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: isMobile ? false : true, // Lower accuracy for better mobile compatibility
          timeout: isMobileSafari ? 20000 : 15000, // Extra time for Safari
          maximumAge: 60000 // 1 minute cache for mobile
        };

        const successCallback = (pos: GeolocationPosition) => {
          console.log('[WeatherWidget] Geolocation success:', pos.coords.latitude, pos.coords.longitude);
          resolve(pos);
        };

        const errorCallback = (error: GeolocationPositionError) => {
          console.error('[WeatherWidget] Geolocation error:', error.code, error.message);
          reject(error);
        };

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
      });

      const { latitude, longitude } = position.coords;
      setCoordinates({ lat: latitude, lon: longitude });

      try {
        // Get city name from coordinates
        await reverseGeocode(latitude, longitude);
        console.log('[WeatherWidget] Successfully got location and reverse geocoded');
      } catch (reverseError) {
        console.warn('[WeatherWidget] Reverse geocoding failed:', reverseError);
        setLocation(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
      }

    } catch (error: any) {
      console.error('[WeatherWidget] Error in getCurrentLocation:', error);

      let fallbackMessage = 'Austin, TX (default)';

      if (error.code === 1) { // PERMISSION_DENIED
        const isMobileSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
        if (isMobileSafari) {
          fallbackMessage = 'Austin, TX • Try: Settings > Safari > Location Services';
        } else {
          fallbackMessage = 'Austin, TX (location permission denied)';
        }
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        fallbackMessage = 'Austin, TX (location service unavailable)';
      } else if (error.code === 3) { // TIMEOUT
        fallbackMessage = 'Austin, TX (location request timed out)';
      }

      setCoordinates({ lat: 30.2672, lon: -97.7431 });
      setLocation(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;
      if (apiKey) {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
        );
        const locationData = await response.json();
        if (locationData && locationData.length > 0) {
          const city = locationData[0];
          setLocation(`${city.name}, ${city.state || city.country}`);
        } else {
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      } else {
        setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      }
    } catch (error) {
      console.log('Could not get location name, using coordinates');
      setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const apiKey = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;
      if (!apiKey) {
        console.error('OpenWeatherMap API key not found');
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`
      );
      const results = await response.json();

      if (results && Array.isArray(results)) {
        setSearchResults(results.map((result: any) => ({
          name: result.name,
          state: result.state,
          country: result.country,
          lat: result.lat,
          lon: result.lon,
          displayName: `${result.name}${result.state ? `, ${result.state}` : ''}, ${result.country}`
        })));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = async (selectedLocation: any) => {
    try {
      setCoordinates({ lat: selectedLocation.lat, lon: selectedLocation.lon });
      setLocation(selectedLocation.displayName);
      setShowLocationSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error selecting location:', error);
    }
  };

  const convertTemperature = (tempCelsius: number, unit: 'fahrenheit' | 'celsius'): number => {
    if (unit === 'fahrenheit') {
      return (tempCelsius * 9/5) + 32;
    }
    return tempCelsius;
  };

  const getTemperatureUnit = (): string => {
    return temperatureUnit === 'fahrenheit' ? 'F' : 'C';
  };

  const formatTemperature = (tempCelsius: number): string => {
    const convertedTemp = convertTemperature(tempCelsius, temperatureUnit);
    return `${Math.round(convertedTemp)}°${getTemperatureUnit()}`;
  };

  const convertWindSpeed = (kmh: number, unit: 'fahrenheit' | 'celsius'): string => {
    if (unit === 'fahrenheit') {
      // Convert km/h to mph
      const mph = kmh * 0.621371;
      return `${Math.round(mph)} mph`;
    }
    return `${Math.round(kmh)} km/h`;
  };

  const convertVisibility = (meters: number, unit: 'fahrenheit' | 'celsius'): string => {
    if (unit === 'fahrenheit') {
      // Convert meters to miles
      const miles = meters * 0.000621371;
      return `${miles.toFixed(1)}mi`;
    }
    return `${Math.round(meters / 1000)}km`;
  };

  const loadWeatherData = async () => {
    try {
      if (!coordinates) {
        console.error('No coordinates available for weather data');
        setWeather(getSampleWeatherData());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Get current weather directly from OpenWeatherMap API
      const currentWeather = await getCurrentWeatherDirect(
        coordinates.lat,
        coordinates.lon
      );

      // Get 5-day forecast directly from OpenWeatherMap API
      const forecast = await getWeatherForecastDirect(
        coordinates.lat,
        coordinates.lon
      );

      // Analyze triathlon conditions
      const conditions = analyzeTriathlonConditions(currentWeather);

      setWeather({
        current: currentWeather,
        forecast: forecast.slice(0, 8), // Next 24 hours (8 x 3-hour intervals)
        conditions
      });
    } catch (error) {
      console.error('Error loading weather data:', error);
      // Set sample data for demo
      setWeather(getSampleWeatherData());
    } finally {
      setIsLoading(false);
    }
  };

  // Direct OpenWeatherMap API call for current weather
  const getCurrentWeatherDirect = async (latitude: number, longitude: number) => {
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not found');
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed * 3.6, // Convert m/s to km/h
      wind_direction: data.wind.deg,
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      visibility: data.visibility || 10000
    };
  };

  // Direct OpenWeatherMap API call for forecast
  const getWeatherForecastDirect = async (latitude: number, longitude: number) => {
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not found');
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();
    return data.list.map((item: any) => ({
      datetime: item.dt_txt,
      temperature: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed * 3.6, // Convert m/s to km/h
      wind_direction: item.wind.deg,
      conditions: item.weather[0].main,
      description: item.weather[0].description,
      precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0
    }));
  };

  // Analyze weather conditions for triathlon suitability
  const analyzeTriathlonConditions = (weather: any) => {
    const conditions = {
      overall: 'good',
      swim: 'good',
      bike: 'good',
      run: 'good',
      warnings: [] as string[]
    };

    // Temperature analysis
    if (weather.temperature < 10) {
      conditions.overall = 'poor';
      conditions.warnings.push('Very cold conditions - hypothermia risk');
    } else if (weather.temperature > 35) {
      conditions.overall = 'poor';
      conditions.warnings.push('Very hot conditions - heat exhaustion risk');
    }

    // Wind analysis
    if (weather.wind_speed > 15) {
      conditions.bike = 'challenging';
      conditions.warnings.push('Strong winds - challenging bike conditions');
    }

    // Precipitation analysis
    if (weather.conditions.includes('Rain') || weather.conditions.includes('Storm')) {
      conditions.bike = 'poor';
      conditions.run = 'challenging';
      conditions.warnings.push('Wet conditions - reduced visibility and traction');
    }

    // Humidity analysis
    if (weather.humidity > 80 && weather.temperature > 25) {
      conditions.run = 'challenging';
      conditions.warnings.push('High humidity - increased dehydration risk');
    }

    return conditions;
  };

  const getSampleWeatherData = (): WeatherData => ({
    current: {
      temperature: 22,
      feels_like: 24,
      humidity: 65,
      wind_speed: 8,
      wind_direction: 180,
      conditions: 'Clear',
      description: 'clear sky',
      visibility: 10000
    },
    forecast: [
      { datetime: '2024-01-15 09:00:00', temperature: 18, conditions: 'Clear', description: 'clear sky', precipitation: 0, wind_speed: 6 },
      { datetime: '2024-01-15 12:00:00', temperature: 22, conditions: 'Clear', description: 'clear sky', precipitation: 0, wind_speed: 8 },
      { datetime: '2024-01-15 15:00:00', temperature: 25, conditions: 'Clouds', description: 'few clouds', precipitation: 0, wind_speed: 10 },
      { datetime: '2024-01-15 18:00:00', temperature: 23, conditions: 'Clouds', description: 'scattered clouds', precipitation: 0, wind_speed: 7 }
    ],
    conditions: {
      overall: 'excellent',
      swim: 'excellent',
      bike: 'good',
      run: 'excellent',
      warnings: []
    }
  });

  const formatTime = (datetime: string): string => {
    // OpenWeatherMap returns UTC time, need to properly parse as UTC
    const date = new Date(datetime + 'Z'); // Add 'Z' to indicate UTC
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'challenging':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return '🟢';
      case 'good':
        return '🔵';
      case 'challenging':
        return '🟡';
      case 'poor':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getWeatherIcon = (conditions: string) => {
    switch (conditions.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'snow':
        return '❄️';
      case 'thunderstorm':
        return '⛈️';
      default:
        return '🌤️';
    }
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Weather Widget Error</h3>
            <p className="text-sm text-white/60">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Weather Conditions</h3>
            <p className="text-sm text-white/60">Loading weather data...</p>
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

  if (!weather) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Weather Conditions</h3>
            <p className="text-sm text-white/60">Unable to load weather data</p>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-white/50">Weather service unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Weather Conditions</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/60">{location}</p>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setShowLocationSearch(!showLocationSearch)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
                    title="Search location"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-1 disabled:opacity-50 relative"
                    title="Use current location"
                  >
                    {isLoading ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl">{getWeatherIcon(weather.current.conditions)}</div>
          </div>
        </div>

        {/* Location Search */}
        {showLocationSearch && (
          <div className="relative">
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchLocations(e.target.value);
                  }}
                  placeholder="Search city, state or zip code..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none text-sm"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2">
                    <svg className="w-4 h-4 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => selectLocation(result)}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {result.displayName}
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                <div className="mt-3 text-sm text-white/50 text-center py-2">
                  No locations found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Current Weather */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-white font-mono">
              {formatTemperature(weather.current.temperature)}
            </div>
            <div className="text-sm text-white/60 capitalize">
              {weather.current.description}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-white/70">Feels like {formatTemperature(weather.current.feels_like)}</div>
            <div className="text-white/70">Humidity {weather.current.humidity}%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-white/60">Wind:</span>
            <span className="text-white font-mono">
              {convertWindSpeed(weather.current.wind_speed, temperatureUnit)} {getWindDirection(weather.current.wind_direction)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white/60">Visibility:</span>
            <span className="text-white font-mono">
              {convertVisibility(weather.current.visibility, temperatureUnit)}
            </span>
          </div>
        </div>
      </div>

      {/* Training Conditions */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">Training Conditions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TbSwimming className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm">Swim</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">{getConditionIcon(weather.conditions.swim)}</span>
              <span className={`text-sm font-medium ${getConditionColor(weather.conditions.swim)}`}>
                {weather.conditions.swim}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TbBike className="w-4 h-4 text-orange-400" />
              <span className="text-white text-sm">Bike</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">{getConditionIcon(weather.conditions.bike)}</span>
              <span className={`text-sm font-medium ${getConditionColor(weather.conditions.bike)}`}>
                {weather.conditions.bike}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TbRun className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm">Run</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">{getConditionIcon(weather.conditions.run)}</span>
              <span className={`text-sm font-medium ${getConditionColor(weather.conditions.run)}`}>
                {weather.conditions.run}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">Today&apos;s Forecast</h4>
        <div className="grid grid-cols-4 gap-2">
          {weather.forecast.slice(0, 4).map((item, index) => (
            <div key={index} className="text-center bg-white/5 rounded-lg p-2">
              <div className="text-xs text-white/60 mb-1">
                {formatTime(item.datetime)}
              </div>
              <div className="text-lg mb-1">
                {getWeatherIcon(item.conditions)}
              </div>
              <div className="text-xs text-white font-mono">
                {Math.round(convertTemperature(item.temperature, temperatureUnit))}°
              </div>
              {item.precipitation > 0 && (
                <div className="text-xs text-blue-400">
                  {item.precipitation}mm
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {weather.conditions.warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-2">Warnings</h4>
          <div className="space-y-1">
            {weather.conditions.warnings.map((warning, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-white/80">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Overall conditions: <span className={getConditionColor(weather.conditions.overall)}>{weather.conditions.overall}</span></span>
          <button
            onClick={() => router.push('/(tabs)/planning')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Race Planning →
          </button>
        </div>
      </div>
    </div>
  );
};