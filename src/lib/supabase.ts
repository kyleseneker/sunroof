/**
 * Supabase client for React Native
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as Keychain from 'react-native-keychain';
import { env } from './env';
import { createLogger } from './logger';

const log = createLogger('Supabase');

const KEYCHAIN_SERVICE = 'com.sunroof.app.auth';

const KeychainAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${KEYCHAIN_SERVICE}.${key}`,
      });
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await Keychain.setGenericPassword(key, value, { service: `${KEYCHAIN_SERVICE}.${key}` });
    } catch {
      log.warn('Keychain setItem failed', { key });
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await Keychain.resetGenericPassword({ service: `${KEYCHAIN_SERVICE}.${key}` });
    } catch {
      log.warn('Keychain removeItem failed', { key });
    }
  },
};

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: KeychainAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
