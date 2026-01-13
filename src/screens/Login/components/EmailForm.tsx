/**
 * Email Form
 * Email input with continue, Apple, and Google buttons
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Mail } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { Button, Input } from '@/components/ui';
import { AppleLogo } from './AppleLogo';
import { GoogleLogo } from './GoogleLogo';

interface EmailFormProps {
  email: string;
  onEmailChange: (text: string) => void;
  emailError: string | null;
  isLoading: boolean;
  onEmailSubmit: () => void;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
}

export function EmailForm({
  email,
  onEmailChange,
  emailError,
  isLoading,
  onEmailSubmit,
  onGoogleSignIn,
  onAppleSignIn,
}: EmailFormProps) {
  const handleEmailChange = (text: string) => {
    onEmailChange(text);
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <Mail size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
        <Input
          placeholder="your@email.com"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="go"
          onSubmitEditing={onEmailSubmit}
          containerStyle={styles.emailInputContainer}
          inputStyle={styles.emailInput}
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>

      {emailError && <Text style={styles.emailErrorText}>{emailError}</Text>}

      <Button
        title="Continue with Email"
        onPress={onEmailSubmit}
        variant="primary"
        size="lg"
        loading={isLoading}
        fullWidth
        style={styles.continueButton}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Apple Sign-in - iOS only */}
      {Platform.OS === 'ios' && (
        <Button
          title="Continue with Apple"
          onPress={onAppleSignIn}
          variant="secondary"
          size="lg"
          loading={isLoading}
          fullWidth
          icon={<AppleLogo size={22} color="#000000" />}
          style={styles.appleButton}
          textStyle={styles.appleButtonText}
          spinnerColor="#000000"
        />
      )}

      <Button
        title="Continue with Google"
        onPress={onGoogleSignIn}
        variant="secondary"
        size="lg"
        loading={isLoading}
        fullWidth
        icon={<GoogleLogo size={20} />}
        style={styles.googleButton}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    marginBottom: spacing.lg,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  emailInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  emailInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: colors.white,
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
  },
  emailErrorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  continueButton: {
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  appleButton: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.white,
  },
  appleButtonText: {
    color: '#000000',
  },
  googleButton: {
    backgroundColor: colors.overlay.dark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.overlay.medium,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: 'rgba(255,255,255,0.4)',
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

