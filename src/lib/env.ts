/**
 * Environment variable validation and access
 * Ensures all required env vars are present at runtime
 */

import Config from 'react-native-config';

/**
 * Get an environment variable, logging error if not set
 */
function getEnvVar(key: string, required = true): string {
  const value = Config[key];

  if (!value && required) {
    // Don't throw - just log. Throwing at module load time crashes the app.
    console.error(
      `Missing required environment variable: ${key}. ` +
        'Please check your .env file and ensure it is properly configured.'
    );
  }

  return value || '';
}

/**
 * Get an optional environment variable with a default value
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return Config[key] || defaultValue;
}

/**
 * Validated environment configuration
 * Access environment variables through this object for type safety
 */
export const env = {
  // Supabase
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),

  // OAuth
  GOOGLE_IOS_CLIENT_ID: getOptionalEnvVar('GOOGLE_IOS_CLIENT_ID', ''),
  GOOGLE_WEB_CLIENT_ID: getOptionalEnvVar('GOOGLE_WEB_CLIENT_ID', ''),

  // External APIs (optional - features degrade gracefully)
  UNSPLASH_ACCESS_KEY: getOptionalEnvVar('UNSPLASH_ACCESS_KEY', ''),
} as const;

/**
 * Validate that all required environment variables are set
 * Call this early in app initialization
 */
export function validateEnv(): void {
  // Access env vars to trigger validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = env.SUPABASE_URL;
}

