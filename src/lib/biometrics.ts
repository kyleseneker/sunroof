/**
 * Biometrics - Face ID / Touch ID authentication
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { createLogger } from './logger';

const log = createLogger('Biometrics');

const rnBiometrics = new ReactNativeBiometrics();

export type BiometricType = 'FaceID' | 'TouchID' | 'Biometrics' | null;

/**
 * Check if biometrics are available on the device
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  try {
    const { available } = await rnBiometrics.isSensorAvailable();
    return available;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.warn('Failed to check biometrics availability', { error: message });
    return false;
  }
}

/**
 * Get the type of biometrics available
 */
export async function getBiometricType(): Promise<BiometricType> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    if (!available) return null;

    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'FaceID';
      case BiometryTypes.TouchID:
        return 'TouchID';
      case BiometryTypes.Biometrics:
        return 'Biometrics';
      default:
        return null;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.warn('Failed to get biometric type', { error: message });
    return null;
  }
}

/**
 * Get human-readable name for biometric type
 */
export function getBiometricName(type: BiometricType): string {
  switch (type) {
    case 'FaceID':
      return 'Face ID';
    case 'TouchID':
      return 'Touch ID';
    case 'Biometrics':
      return 'Biometrics';
    default:
      return 'Biometrics';
  }
}

/**
 * Prompt user for biometric authentication
 */
export async function authenticateWithBiometrics(
  promptMessage = 'Unlock Sunroof'
): Promise<boolean> {
  try {
    // Check if biometrics is available first
    const { available } = await rnBiometrics.isSensorAvailable();
    if (!available) {
      log.warn('Biometrics not available, skipping authentication');
      return true; // Let user through if biometrics not available
    }

    const { success } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });

    if (success) {
      log.debug('Biometric authentication successful');
    } else {
      log.debug('Biometric authentication cancelled or failed');
    }

    return success;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Biometric authentication error', { error: message });
    // Return true on error to prevent locking user out
    return true;
  }
}
