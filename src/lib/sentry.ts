/**
 * Sentry configuration
 * Centralized setup for error tracking, logging, and performance monitoring
 */

import * as Sentry from '@sentry/react-native';

// Create navigation integration for React Navigation
export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

// Initialize Sentry
Sentry.init({
  dsn: 'https://7b1e7215fc30f534942f20642b2942ac@o4510692983439360.ingest.us.sentry.io/4510692983635968',

  // Adds more context data to events (IP address, cookies, user, etc.)
  sendDefaultPii: true,

  // Enable Logs (filter out trace/debug)
  enableLogs: true,
  beforeSendLog: (log) => {
    if (log.level === 'trace' || log.level === 'debug') {
      return null;
    }
    return log;
  },

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in dev, reduce in prod
  profilesSampleRate: 1.0, // Profile 100% of sampled transactions

  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.reactNativeTracingIntegration(),
    navigationIntegration,
  ],
});

export { Sentry };
