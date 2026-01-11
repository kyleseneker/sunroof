/**
 * Lock Screen
 * Semi-transparent overlay that prompts for Face ID / Touch ID
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ScanFace, Fingerprint } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import {
  authenticateWithBiometrics,
  getBiometricType,
  getBiometricName,
  type BiometricType,
} from '@/lib';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const insets = useSafeAreaInsets();
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [showRetry, setShowRetry] = useState(false);
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    getBiometricType().then(setBiometricType);
  }, []);

  const handleAuthenticate = useCallback(async () => {
    setShowRetry(false);
    try {
      const success = await authenticateWithBiometrics('Unlock Sunroof');
      if (success) {
        onUnlock();
      } else {
        setShowRetry(true);
      }
    } catch {
      // On error, let user through
      onUnlock();
    }
  }, [onUnlock]);

  // Auto-prompt on mount (once only)
  useEffect(() => {
    if (hasPromptedRef.current) return;
    hasPromptedRef.current = true;
    
    // Small delay to ensure the blur is visible first
    const timer = setTimeout(() => {
      handleAuthenticate();
    }, 300);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const BiometricIcon = biometricType === 'TouchID' ? Fingerprint : ScanFace;
  const biometricName = getBiometricName(biometricType);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {showRetry && (
          <TouchableOpacity
            onPress={handleAuthenticate}
            style={styles.retryButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.retryButtonGradient}
            >
              <BiometricIcon size={32} color={colors.white} />
            </LinearGradient>
            <Text style={styles.retryText}>Tap to unlock with {biometricName}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    alignItems: 'center',
  },
  retryButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
    textAlign: 'center',
  },
});
