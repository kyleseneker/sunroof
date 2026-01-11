/**
 * Location utilities using @react-native-community/geolocation
 */

import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import type { MemoryLocation } from '@/types';
import { createLogger } from './logger';

const log = createLogger('Location');

// Configure geolocation
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

// Cache permission state to avoid repeated authorization requests
let locationPermissionGranted: boolean | null = null;

/**
 * Request location permissions (cached after first successful grant)
 */
async function requestLocationPermission(): Promise<boolean> {
  // Return cached result if we've already been granted permission
  if (locationPermissionGranted === true) {
    return true;
  }

  try {
    if (Platform.OS === 'ios') {
      // iOS permissions are handled automatically by the library
      const granted = await new Promise<boolean>((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          () => resolve(false)
        );
      });
      locationPermissionGranted = granted;
      return granted;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Sunroof needs access to your location to add context to your memories.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      locationPermissionGranted = hasPermission;
      return hasPermission;
    }
  } catch {
    return false;
  }
}

/**
 * Get current location
 */
export async function getLocationContext(): Promise<MemoryLocation | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try reverse geocoding using a free API
          let name: string | undefined;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { 'User-Agent': 'Sunroof App' } }
            );
            const data = await response.json();
            if (data.address) {
              const parts: string[] = [];
              if (data.address.city || data.address.town || data.address.village) {
                parts.push(data.address.city || data.address.town || data.address.village);
              }
              if (data.address.state) {
                parts.push(data.address.state);
              }
              name = parts.join(', ') || undefined;
            }
          } catch {
            // Geocoding failed, continue without name
          }

          log.debug(' Location retrieved', { latitude, longitude, name });
          resolve({ latitude, longitude, name });
        },
        (error) => {
          log.warn(' Failed to get position', { 
            code: error.code, 
            message: error.message,
          });
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.warn(' Failed to get location', { error: message });
    return null;
  }
}
