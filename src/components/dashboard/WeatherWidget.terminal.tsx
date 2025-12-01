import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { terminalColors, terminalText, terminalView, mergeStyles } from '../ui/terminal/terminalStyles';

interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
}

export const WeatherWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<string>('Austin, TX');
  const [isGeolocating, setIsGeolocating] = useState(false);

  useEffect(() => {
    // Simplified - would normally fetch real weather data
    setTimeout(() => {
      setWeather({
        temperature: 72,
        conditions: 'Partly Cloudy',
        humidity: 55,
        windSpeed: 8
      });
      setIsLoading(false);
    }, 500);
  }, [user]);

  const handleGeolocate = async () => {
    setIsGeolocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

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
            console.error('[Weather] Geocoding error:', error);
            setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W`);
          }

          setIsGeolocating(false);
          console.log('[Weather] Location updated:', latitude, longitude);
        },
        (error) => {
          console.error('[Weather] Geolocation error:', error);
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
            <Text style={mergeStyles(terminalText.run, { fontSize: 10 })}>
              GOOD
            </Text>
          </View>

          {/* Bike */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: terminalColors.bg, borderWidth: 1, borderColor: terminalColors.border, padding: 12 }}>
            <Text style={mergeStyles(terminalText.bike, { fontSize: 10 })}>
              [BIKE]
            </Text>
            <Text style={mergeStyles(terminalText.run, { fontSize: 10 })}>
              GOOD
            </Text>
          </View>

          {/* Run */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: terminalColors.bg, borderWidth: 1, borderColor: terminalColors.border, padding: 12 }}>
            <Text style={mergeStyles(terminalText.run, { fontSize: 10 })}>
              [RUN]
            </Text>
            <Text style={mergeStyles(terminalText.run, { fontSize: 10 })}>
              EXCELLENT
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={mergeStyles(terminalView.borderTop, { marginTop: 16 })}>
        <View style={terminalView.spaceBetween}>
          <Text style={mergeStyles(terminalText.small, { textTransform: 'uppercase' })}>
            GOOD CONDITIONS
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/planning')}>
            <Text style={terminalText.yellow}>PLAN →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
