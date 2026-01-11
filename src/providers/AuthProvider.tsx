/**
 * Authentication Provider for React Native
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { supabase, createLogger } from '@/lib';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

const log = createLogger('Auth');

const REDIRECT_URL = 'sunroof://auth/callback';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
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
        const { data: { session }, error } = await supabase.auth.getSession();
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { error: error as Error };
      }

      if (data?.url) {
        // Check if InAppBrowser is available
        if (await InAppBrowser.isAvailable()) {
          const result = await InAppBrowser.openAuth(data.url, REDIRECT_URL, {
            // iOS options
            ephemeralWebSession: false,
            // Android options
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
          });
          
          if (result.type === 'success' && result.url) {
            // Extract tokens from the redirect URL
            const hashPart = result.url.split('#')[1];
            if (hashPart) {
              const params = new URLSearchParams(hashPart);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken && refreshToken) {
                const { error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                
                if (sessionError) {
                  return { error: sessionError as Error };
                }
              }
            }
          } else if (result.type === 'cancel') {
            return { error: new Error('Authentication cancelled') };
          }
        } else {
          // Fallback to regular Linking
          await Linking.openURL(data.url);
        }
      }

      log.info(' Google sign in successful');
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Google sign in error', { error: message });
      return { error: err as Error };
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
    <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signInWithGoogle, signOut }}>
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
