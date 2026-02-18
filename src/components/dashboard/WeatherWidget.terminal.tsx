import { logger } from '../../utils/logger';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { terminalColors, terminalText, terminalView, mergeStyles } from '../ui/terminal/terminalStyles';
import { OpenWeatherMapAPIService } from '../../services/apiIntegrations';

interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  trainingConditions?: {
    overall: string;
    swim: string;
    bike: string;
    run: string;
  };
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const WeatherWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<string>('Austin, TX');
  const [locationCoords, setLocationCoords] = useState<LocationCoords>({ latitude: 30.2672, longitude: -97.7431 }); // Default: Austin, TX
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Fetch weather data for given coordinates
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    setIsLoading(true);
    try {
      // Call OpenWeatherMap API directly
      const apiKey = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match our expected format
      const weatherData = {
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        wind_direction: data.wind.deg,
        conditions: data.weather[0].main,
        description: data.weather[0].description,
        visibility: data.visibility,
        timestamp: new Date().toISOString()
      };

      // Analyze triathlon conditions
      const conditions = OpenWeatherMapAPIService.analyzeTriathlonConditions(weatherData);

      setWeather({
        temperature: Math.round(weatherData.temperature),
        conditions: weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1),
        humidity: weatherData.humidity,
        windSpeed: Math.round(weatherData.wind_speed),
        trainingConditions: conditions
      });
    } catch (error) {
      logger.error('[Weather] Failed to fetch weather data:', error);
      // Fallback to default weather
      setWeather({
        temperature: 72,
        conditions: 'Partly Cloudy',
        humidity: 55,
        windSpeed: 8,
        trainingConditions: {
          overall: 'good',
          swim: 'good',
          bike: 'good',
          run: 'good'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather data when component mounts or coordinates change
    fetchWeatherData(locationCoords.latitude, locationCoords.longitude);
  }, [locationCoords]);

  const handleGeolocate = async () => {
    setIsGeolocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Update coordinates state (this will trigger weather fetch via useEffect)
          setLocationCoords({ latitude, longitude });

          try {
            // Reverse geocode to get city name
            const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              // Extract city and state from address components
              const addressComponents = data.results[0].address_components;
              let city = '';
              let state = '';

              for (const component of addressComponents) {
                if (component.types.includes('locality')) {
                  city = component.short_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                  state = component.short_name;
                }
              }

              const locationName = city && state ? `${city}, ${state}` :
                                   data.results[0].formatted_address.split(',').slice(0, 2).join(',');
              setLocation(locationName);
            } else {
              setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W`);
            }
          } catch (error) {
            logger.error('[Weather] Geocoding error:', error);
            setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W`);
          }

          setIsGeolocating(false);
          logger.debug('[Weather] Location updated:', latitude, longitude);
        },
        (error) => {
          logger.error('[Weather] Geolocation error:', error);
          setLocation('Austin, TX • Location unavailable');
          setIsGeolocating(false);
        }
      );
    } else {
      setLocation('Austin, TX • Geolocation not supported');
      setIsGeolocating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Weather Conditions</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16 })}>
          Loading weather data...
        </Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Weather Conditions</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16, textAlign: 'center' })}>
          WEATHER UNAVAILABLE
        </Text>
      </View>
    );
  }

  return (
    <View style={terminalView.card}>
      {/* Header */}
      <View style={terminalView.spaceBetween}>
        <View style={{ flex: 1 }}>
          <Text style={terminalText.header}>Weather Conditions</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
            <Text style={terminalText.small}>
              {location.toUpperCase()}
            </Text>
            <TouchableOpacity
              onPress={handleGeolocate}
              disabled={isGeolocating}
              style={{
                backgroundColor: terminalColors.yellow,
                paddingHorizontal: 8,
                paddingVertical: 4,
                opacity: isGeolocating ? 0.5 : 1
              }}
            >
              <Text style={mergeStyles(terminalText.small, { color: terminalColors.bg, fontSize: 9, fontWeight: 'bold' })}>
                {isGeolocating ? '[...]' : '[📍]'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Current Temperature */}
      <View style={{ marginTop: 24, marginBottom: 24, backgroundColor: terminalColors.bg, borderWidth: 2, borderColor: terminalColors.border, padding: 16 }}>
        <View style={terminalView.spaceBetween}>
          <View>
            <Text style={{ fontFamily: 'monospace', fontSize: 48, fontWeight: 'bold', color: terminalColors.yellow }}>
              {weather.temperature}°F
            </Text>
            <Text style={mergeStyles(terminalText.small, { marginTop: 8, textTransform: 'uppercase' })}>
              {weather.conditions}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={terminalText.small}>
              HUMID {weather.humidity}%
            </Text>
            <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
              WIND {weather.windSpeed}MPH
            </Text>
          </View>
        </View>
      </View>

      {/* Training Conditions */}
      <View>
        <Text style={mergeStyles(terminalText.subheader, { marginBottom: 12 })}>
          Training Conditions
        </Text>
        <View style={{ gap: 8 }}>
          {/* Swim */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: terminalColors.bg, borderWidth: 1, borderColor: terminalColors.border, padding: 12 }}>
            <Text style={mergeStyles(terminalText.swim, { fontSize: 10 })}>
              [SWIM]
            </Text>
            <Text style={mergeStyles(terminalText.base, {
              fontSize: 10,
              color: weather.trainingConditions?.swim === 'good' ? terminalColors.green :
                     weather.trainingConditions?.swim === 'challenging' ? terminalColors.yellow :
                     terminalColors.red
            })}>
              {weather.trainingConditions?.swim.toUpperCase() || 'GOOD'}
            </Text>
          </View>

          {/* Bike */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: terminalColors.bg, borderWidth: 1, borderColor: terminalColors.border, padding: 12 }}>
            <Text style={mergeStyles(terminalText.bike, { fontSize: 10 })}>
              [BIKE]
            </Text>
            <Text style={mergeStyles(terminalText.base, {
              fontSize: 10,
              color: weather.trainingConditions?.bike === 'good' ? terminalColors.green :
                     weather.trainingConditions?.bike === 'challenging' ? terminalColors.yellow :
                     terminalColors.red
            })}>
              {weather.trainingConditions?.bike.toUpperCase() || 'GOOD'}
            </Text>
          </View>

          {/* Run */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: terminalColors.bg, borderWidth: 1, borderColor: terminalColors.border, padding: 12 }}>
            <Text style={mergeStyles(terminalText.run, { fontSize: 10 })}>
              [RUN]
            </Text>
            <Text style={mergeStyles(terminalText.base, {
              fontSize: 10,
              color: weather.trainingConditions?.run === 'good' ? terminalColors.green :
                     weather.trainingConditions?.run === 'challenging' ? terminalColors.yellow :
                     terminalColors.red
            })}>
              {weather.trainingConditions?.run.toUpperCase() || 'GOOD'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={mergeStyles(terminalView.borderTop, { marginTop: 16 })}>
        <View style={terminalView.spaceBetween}>
          <Text style={mergeStyles(terminalText.small, {
            textTransform: 'uppercase',
            color: weather.trainingConditions?.overall === 'good' ? terminalColors.green :
                   weather.trainingConditions?.overall === 'moderate' ? terminalColors.yellow :
                   terminalColors.red
          })}>
            {weather.trainingConditions?.overall.toUpperCase() || 'GOOD'} CONDITIONS
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/planning')}>
            <Text style={terminalText.yellow}>PLAN →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
