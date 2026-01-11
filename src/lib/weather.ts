/**
 * Weather API utilities
 */

import type { MemoryWeather } from '@/types';
import { createLogger } from './logger';

const log = createLogger('Weather');

const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';

interface WeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
}

// Weather code to condition/icon mapping
const WEATHER_CONDITIONS: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: '☀️' },
  1: { condition: 'Mostly Clear', icon: '🌤️' },
  2: { condition: 'Partly Cloudy', icon: '⛅' },
  3: { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Foggy', icon: '🌫️' },
  51: { condition: 'Light Drizzle', icon: '🌧️' },
  53: { condition: 'Drizzle', icon: '🌧️' },
  55: { condition: 'Heavy Drizzle', icon: '🌧️' },
  61: { condition: 'Light Rain', icon: '🌧️' },
  63: { condition: 'Rain', icon: '🌧️' },
  65: { condition: 'Heavy Rain', icon: '🌧️' },
  71: { condition: 'Light Snow', icon: '❄️' },
  73: { condition: 'Snow', icon: '❄️' },
  75: { condition: 'Heavy Snow', icon: '❄️' },
  77: { condition: 'Snow Grains', icon: '❄️' },
  80: { condition: 'Rain Showers', icon: '🌦️' },
  81: { condition: 'Rain Showers', icon: '🌦️' },
  82: { condition: 'Heavy Showers', icon: '🌦️' },
  85: { condition: 'Snow Showers', icon: '🌨️' },
  86: { condition: 'Snow Showers', icon: '🌨️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm', icon: '⛈️' },
  99: { condition: 'Thunderstorm', icon: '⛈️' },
};

/**
 * Get weather data for coordinates
 */
export async function getWeather(
  latitude: number,
  longitude: number
): Promise<MemoryWeather | null> {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,weather_code',
      temperature_unit: 'fahrenheit',
    });

    const response = await fetch(`${WEATHER_API_BASE}/forecast?${params}`);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: WeatherResponse = await response.json();
    const { temperature_2m, relative_humidity_2m, weather_code } = data.current;
    const weatherInfo = WEATHER_CONDITIONS[weather_code] || { condition: 'Unknown', icon: '🌡️' };

    log.debug('Weather fetched', { 
      temp: Math.round(temperature_2m), 
      condition: weatherInfo.condition,
    });

    return {
      temp: Math.round(temperature_2m),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      humidity: relative_humidity_2m,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.warn('Failed to fetch weather', { error: message, latitude, longitude });
    return null;
  }
}

