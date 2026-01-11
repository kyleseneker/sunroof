/**
 * useAppState hook
 * Track app foreground/background state
 */

import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { createLogger } from '@/lib';

const log = createLogger('AppState');

interface UseAppStateOptions {
  /** Callback when app comes to foreground */
  onForeground?: () => void;
  /** Callback when app goes to background */
  onBackground?: () => void;
  /** Callback on any state change */
  onChange?: (state: AppStateStatus) => void;
}

/**
 * Track the app's foreground/background state
 *
 * @example
 * // Refresh data when app returns to foreground
 * useAppState({
 *   onForeground: () => {
 *     refetchJourneys();
 *   },
 * });
 *
 * @example
 * // Get current state
 * const { appState, isActive } = useAppState();
 */
export function useAppState(options?: UseAppStateOptions) {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const previousState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Detect foreground transition
      if (
        previousState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        log.debug('App came to foreground');
        options?.onForeground?.();
      }

      // Detect background transition
      if (
        previousState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        log.debug('App went to background');
        options?.onBackground?.();
      }

      // Always call onChange
      options?.onChange?.(nextAppState);

      previousState.current = nextAppState;
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [options]);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
  };
}

