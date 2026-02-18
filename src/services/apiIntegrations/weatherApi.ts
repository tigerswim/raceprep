import { logger } from '../../utils/logger';

// API Configuration - Using Local Proxy Server
const API_CONFIG = {
  openWeather: {
    baseUrl: 'http://localhost:3001/api/weather',
    key: process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY,
  }
};

// OpenWeatherMap API Integration
export class OpenWeatherMapAPIService {

  // Get current weather for coordinates
  static async getCurrentWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `${API_CONFIG.openWeather.baseUrl}/current?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      return {
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
    } catch (error) {
      logger.error('OpenWeatherMap current weather error:', error);
      throw error;
    }
  }

  // Get weather forecast for coordinates
  static async getWeatherForecast(latitude, longitude, days = 5) {
    try {
      const response = await fetch(
        `${API_CONFIG.openWeather.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      return data.list.map(item => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        wind_direction: item.wind.deg,
        conditions: item.weather[0].main,
        description: item.weather[0].description,
        precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0
      }));
    } catch (error) {
      logger.error('OpenWeatherMap forecast error:', error);
      throw error;
    }
  }

  // Get historical weather data (requires paid plan)
  static async getHistoricalWeather(latitude, longitude, timestamp) {
    try {
      const response = await fetch(
        `${API_CONFIG.openWeather.baseUrl}/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${timestamp}&appid=${API_CONFIG.openWeather.key}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        temperature: data.current.temp,
        feels_like: data.current.feels_like,
        humidity: data.current.humidity,
        wind_speed: data.current.wind_speed,
        wind_direction: data.current.wind_deg,
        conditions: data.current.weather[0].main,
        description: data.current.weather[0].description
      };
    } catch (error) {
      logger.error('OpenWeatherMap historical weather error:', error);
      throw error;
    }
  }

  // Analyze weather conditions for triathlon suitability
  static analyzeTriathlonConditions(weather) {
    const conditions = {
      overall: 'good',
      swim: 'good',
      bike: 'good',
      run: 'good',
      warnings: []
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
  }
}
