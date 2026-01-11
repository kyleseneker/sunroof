/**
 * Logger utility
 * Provides structured logging with different levels
 * Only outputs in development mode (except for errors)
 */

/* eslint-disable no-console */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

const isDev = __DEV__;

function formatMessage(level: LogLevel, tag: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${tag}]`;

  if (context) {
    return `${prefix} ${message} ${JSON.stringify(context)}`;
  }

  return `${prefix} ${message}`;
}

function shouldLog(level: LogLevel): boolean {
  // Always log errors
  if (level === 'error') return true;

  // Only log other levels in development
  return isDev;
}

/**
 * Create a logger instance for a specific module/component
 * This is the preferred way to use logging throughout the app
 *
 * @example
 * const log = createLogger('JourneyService');
 * log.debug('Journey created', { journeyId: data.id });
 * log.error('Failed to create journey', { error: message });
 */
export function createLogger(tag: string): Logger {
  return {
    debug: (message: string, context?: LogContext) => {
      if (shouldLog('debug')) {
        console.log(formatMessage('debug', tag, message, context));
      }
    },
    info: (message: string, context?: LogContext) => {
      if (shouldLog('info')) {
        console.log(formatMessage('info', tag, message, context));
      }
    },
    warn: (message: string, context?: LogContext) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', tag, message, context));
      }
    },
    error: (message: string, context?: LogContext) => {
      console.error(formatMessage('error', tag, message, context));
      // In production, send to error tracking service
      // if (!isDev) {
      //   Sentry.captureMessage(message, { level: 'error', extra: { tag, ...context } });
      // }
    },
  };
}

// Default logger for backward compatibility and generic logging
export const logger = createLogger('App');

/**
 * Group related logs together (development only)
 */
export function logGroup(label: string, fn: () => void): void {
  if (isDev) {
    console.group(label);
    fn();
    console.groupEnd();
  }
}

/**
 * Time an operation (development only)
 */
export function logTime(label: string): void {
  if (isDev) {
    console.time(label);
  }
}

export function logTimeEnd(label: string): void {
  if (isDev) {
    console.timeEnd(label);
  }
}


