/**
 * Sunroof - React Native App
 *
 * A time capsule app for capturing memories during journeys
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, ToastProvider, OfflineProvider, useAuth } from '@/providers';
import { AppNavigator } from '@/navigation';
import { OfflineIndicator, LockScreen } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initializeNotifications, validateEnv, createLogger, getPreference } from '@/lib';

const log = createLogger('App');

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(true);

  // Check if we should show lock screen
  const checkLockScreen = useCallback(async () => {
    try {
      if (!user) {
        setIsLocked(false);
        setCheckingLock(false);
        return;
      }

      const biometricsEnabled = await getPreference('biometricsEnabled');
      setIsLocked(biometricsEnabled);
      setCheckingLock(false);
    } catch (error) {
      // If anything fails, just show the app (don't lock user out)
      console.error('Lock screen check failed:', error);
      setIsLocked(false);
      setCheckingLock(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkLockScreen();
    }
  }, [authLoading, checkLockScreen]);

  // Lock app when it goes to background (if biometrics enabled)
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === 'background' && user) {
        const biometricsEnabled = await getPreference('biometricsEnabled');
        if (biometricsEnabled) {
          setIsLocked(true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user]);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  // Show nothing while checking auth/lock state
  if (authLoading || checkingLock) {
    return null;
  }

  // Show lock screen if locked
  if (isLocked && user) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <View style={styles.root}>
      <AppNavigator />
      <OfflineIndicator position="top" />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    log.info('App starting', { 
      dev: __DEV__, 
      timestamp: new Date().toISOString(),
    });

    // Validate environment variables on app start
    try {
      validateEnv();
      log.debug('Environment validated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Environment validation failed', { error: message });
    }

    // Initialize notification channels on app start
    initializeNotifications()
      .then(() => log.debug('Notifications initialized'))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        log.warn('Failed to initialize notifications', { error: message });
      });
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <AuthProvider>
            <OfflineProvider>
              <ToastProvider>
                <StatusBar barStyle="light-content" />
                <AppContent />
              </ToastProvider>
            </OfflineProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
