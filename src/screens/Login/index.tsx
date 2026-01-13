/**
 * Login Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, fontSize } from '@/constants/theme';
import { Background, IconButton } from '@/components/ui';
import { useAuth } from '@/providers';
import { hapticSuccess, hapticError, createLogger } from '@/lib';
import { supabase } from '@/lib/supabase';
import type { RootStackParamList } from '@/types';

import { LoginHero, EmailForm, OtpVerification } from './components';

const log = createLogger('LoginScreen');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { signInWithEmail, signInWithGoogle, signInWithApple } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Hide splash screen when login screen mounts
  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  const handleEmailSignIn = useCallback(async () => {
    setEmailError(null);

    if (!email.trim()) {
      setEmailError('Please enter your email');
      hapticError();
      return;
    }

    log.info('Email sign-in attempt', { email: email.trim() });
    setIsLoading(true);
    const { error } = await signInWithEmail(email.trim());
    setIsLoading(false);

    if (error) {
      log.warn('Email sign-in failed', { error: error.message });
      setEmailError(error.message);
      hapticError();
    } else {
      log.info('OTP sent successfully');
      setEmailSent(true);
      hapticSuccess();
    }
  }, [email, signInWithEmail]);

  const handleGoogleSignIn = useCallback(async () => {
    setEmailError(null);
    log.info('Google sign-in attempt');
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      log.warn('Google sign-in failed', { error: error.message });
      setEmailError(error.message);
      hapticError();
    } else {
      log.info('Google sign-in successful');
    }
  }, [signInWithGoogle]);

  const handleAppleSignIn = useCallback(async () => {
    setEmailError(null);
    log.info('Apple sign-in attempt');
    setIsLoading(true);
    const { error } = await signInWithApple();
    setIsLoading(false);

    if (error) {
      log.warn('Apple sign-in failed', { error: error.message });
      setEmailError(error.message);
      hapticError();
    } else {
      log.info('Apple sign-in successful');
    }
  }, [signInWithApple]);

  // OTP handlers
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      setOtpError(null);
    },
    [otp]
  );

  const handleOtpKeyPress = useCallback((_index: number, _key: string) => {
    // Key press handling is done in OtpVerification component
  }, []);

  // Auto-verify when all 8 digits entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 8 && emailSent) {
      verifyOtp(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, emailSent]);

  const verifyOtp = async (code: string) => {
    setVerifying(true);
    setOtpError(null);
    log.info('OTP verification attempt');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'email',
      });

      if (verifyError) {
        log.warn('OTP verification failed', { error: verifyError.message });
        setOtpError('Invalid code. Please try again.');
        setOtp(['', '', '', '', '', '', '', '']);
        setVerifying(false);
        return;
      }

      if (!data.session) {
        log.warn('OTP verified but no session returned');
        setOtpError('Something went wrong. Please try again.');
        setVerifying(false);
      } else {
        log.info('OTP verification successful');
      }
      // Auth state will update automatically via AuthProvider
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('OTP verification error', { error: message });
      setOtpError('Something went wrong. Please try again.');
      setVerifying(false);
    }
  };

  const handleResendCode = useCallback(async () => {
    log.info('Resending OTP code');
    setIsLoading(true);
    setOtpError(null);
    setOtp(['', '', '', '', '', '', '', '']);

    const { error } = await signInWithEmail(email.trim());
    setIsLoading(false);

    if (error) {
      log.warn('Resend OTP failed', { error: error.message });
      setOtpError(error.message);
      hapticError();
    } else {
      log.info('OTP resent successfully');
      hapticSuccess();
    }
  }, [email, signInWithEmail]);

  const handleChangeEmail = useCallback(() => {
    setEmailSent(false);
    setEmail('');
    setOtp(['', '', '', '', '', '', '', '']);
    setOtpError(null);
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailError(null);
  }, []);

  return (
    <View style={styles.container}>
      <Background unsplashQuery="warm sunset mountain landscape" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Help button - top right */}
          <View style={styles.topBar}>
            <View style={styles.spacer} />
            <IconButton
              icon={<HelpCircle size={22} color="rgba(255,255,255,0.6)" />}
              onPress={() => navigation.navigate('Help')}
              accessibilityLabel="Help"
              variant="ghost"
            />
          </View>

          {/* Main content */}
          <View style={styles.mainContent}>
            {/* Hero (hide during OTP entry) */}
            {!emailSent && <LoginHero />}

            {/* Auth form */}
            <View style={styles.authContainer}>
              {emailSent ? (
                <OtpVerification
                  email={email}
                  otp={otp}
                  onOtpChange={handleOtpChange}
                  onOtpKeyPress={handleOtpKeyPress}
                  verifying={verifying}
                  otpError={otpError}
                  isLoading={isLoading}
                  onResendCode={handleResendCode}
                  onChangeEmail={handleChangeEmail}
                />
              ) : (
                <EmailForm
                  email={email}
                  onEmailChange={handleEmailChange}
                  emailError={emailError}
                  isLoading={isLoading}
                  onEmailSubmit={handleEmailSignIn}
                  onGoogleSignIn={handleGoogleSignIn}
                  onAppleSignIn={handleAppleSignIn}
                />
              )}
            </View>

            {/* Legal text */}
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>By signing in, you agree to our </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.legalText}> and </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                <Text style={styles.legalLink}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  // Main content
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
  },
  // Auth container
  authContainer: {
    width: '100%',
  },
  legalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  legalText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.4)',
  },
  legalLink: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
  },
  spacer: {
    flex: 1,
  },
});
