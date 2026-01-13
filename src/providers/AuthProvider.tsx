/**
 * Authentication Provider for React Native
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Linking, Platform } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase, createLogger } from '@/lib';
import { env } from '@/lib/env';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Generate a random nonce for Apple Sign-in (hex characters only for safety)
function generateNonce(length = 32): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const log = createLogger('Auth');

const REDIRECT_URL = 'sunroof://auth/callback';

// Configure Google Sign-in
GoogleSignin.configure({
  iosClientId: env.GOOGLE_IOS_CLIENT_ID,
  webClientId: env.GOOGLE_WEB_CLIENT_ID,
});

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthChange = useCallback((event: AuthChangeEvent, session: Session | null) => {
    log.debug(' Auth state changed', { event, hasSession: !!session });

    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  // Handle deep link for OAuth callback
  const handleDeepLink = useCallback(async (url: string) => {
    if (url.includes('auth/callback')) {
      try {
        // Extract tokens from the URL hash fragment
        const hashPart = url.split('#')[1];
        if (hashPart) {
          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              log.error(' Set session error', { error: error.message });
            } else {
              log.info(' Session set from deep link');
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        log.error(' Deep link error', { error: message });
      }
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          log.error(' Get session error', { error: error.message });
        } else {
          log.debug(' Session initialized', { hasSession: !!session });
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        log.error(' Init session error', { error: message });
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Listen for deep links
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [handleAuthChange, handleDeepLink]);

  const signInWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: REDIRECT_URL,
        },
      });

      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Check if Google Sign-in is configured
      if (!env.GOOGLE_IOS_CLIENT_ID && Platform.OS === 'ios') {
        return { error: new Error('Google Sign-in is not configured') };
      }

      // Trigger native Google Sign-in
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      // User cancelled
      if (response.type === 'cancelled') {
        log.debug('Google sign in cancelled by user');
        return { error: null };
      }

      if (!response.data?.idToken) {
        return { error: new Error('Sign in failed. Please try again.') };
      }

      // Exchange Google token with Supabase
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
        nonce: undefined,
      });

      if (error) {
        log.error('Google sign in error', { error: error.message });
        return { error: error as Error };
      }

      log.info('Google sign in successful');
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      // User cancelled - not an error, just return silently
      if (
        message.includes('canceled') ||
        message.includes('cancelled') ||
        message.includes('SIGN_IN_CANCELLED')
      ) {
        log.debug('Google sign in cancelled by user');
        return { error: null };
      }
      log.error('Google sign in error', { error: message });
      return { error: new Error('Sign in failed. Please try again.') };
    }
  };

  const signInWithApple = async () => {
    try {
      // Check if Apple Sign-in is available (iOS 13+)
      if (Platform.OS !== 'ios') {
        return { error: new Error('Apple Sign-in is only available on iOS') };
      }

      if (!appleAuth.isSupported) {
        return { error: new Error('Apple Sign-in is not supported on this device') };
      }

      // Generate nonce for Apple Sign-in
      const rawNonce = generateNonce();

      // Perform native Apple Sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        nonce: rawNonce,
      });

      if (!appleAuthRequestResponse.identityToken) {
        return { error: new Error('No identity token received from Apple') };
      }

      // Exchange Apple token with Supabase using raw nonce
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleAuthRequestResponse.identityToken,
        nonce: rawNonce,
      });

      if (error) {
        log.error('Apple sign in error', { error: error.message });
        return { error: error as Error };
      }

      log.info('Apple sign in successful');
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      // User cancelled - not an error, just return silently
      if (
        message.includes('canceled') ||
        message.includes('cancelled') ||
        message.includes('1001')
      ) {
        log.debug('Apple sign in cancelled by user');
        return { error: null };
      }
      log.error('Apple sign in error', { error: message });
      return { error: new Error('Sign in failed. Please try again.') };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      log.info(' User signed out');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Sign out error', { error: message });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
