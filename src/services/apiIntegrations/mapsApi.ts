import { logger } from '../../utils/logger';
import { rateLimiter } from './rateLimiter';

// API Configuration - Using Local Proxy Server
const API_CONFIG = {
  googleMaps: {
    baseUrl: 'http://localhost:3001/api/maps',
    key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
};

// Google Maps API Integration
export class GoogleMapsAPIService {

  // Geocode location to get coordinates
  static async geocodeLocation(address) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_CONFIG.googleMaps.key}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results[0]?.geometry?.location || null;
    } catch (error) {
      logger.error('Google Maps geocoding error:', error);
      throw error;
    }
  }

  // Get elevation data for coordinates
  static async getElevationData(coordinates) {
    try {
      const locations = coordinates.map(coord => `${coord.lat},${coord.lng}`).join('|');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${API_CONFIG.googleMaps.key}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      logger.error('Google Maps elevation error:', error);
      throw error;
    }
  }

  // Calculate course elevation profile
  static calculateElevationProfile(elevations) {
    if (elevations.length < 2) return { gain: 0, loss: 0, max: 0, min: 0 };

    let gain = 0;
    let loss = 0;
    let max = elevations[0].elevation;
    let min = elevations[0].elevation;

    for (let i = 1; i < elevations.length; i++) {
      const current = elevations[i].elevation;
      const previous = elevations[i - 1].elevation;
      const diff = current - previous;

      if (diff > 0) gain += diff;
      else loss += Math.abs(diff);

      max = Math.max(max, current);
      min = Math.min(min, current);
    }

    return {
      gain: Math.round(gain),
      loss: Math.round(loss),
      max: Math.round(max),
      min: Math.round(min)
    };
  }
}

// Geolocation Service
export class GeolocationService {

  // Get user's current location
  static async getCurrentLocation(): Promise<{latitude: number, longitude: number} | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          logger.error('Geolocation error:', error);
          resolve(null);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two points (Haversine formula)
  static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Filter events/races by location
  static filterByLocation<T extends {latitude?: number, longitude?: number}>(
    items: T[],
    userLat: number,
    userLon: number,
    radiusMiles: number = 50
  ): T[] {
    return items.filter(item => {
      if (!item.latitude || !item.longitude) return false;
      const distance = this.calculateDistance(userLat, userLon, item.latitude, item.longitude);
      return distance <= radiusMiles;
    });
  }
}
