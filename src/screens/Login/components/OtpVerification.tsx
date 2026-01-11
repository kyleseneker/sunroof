/**
 * OTP Verification
 * 8-digit code input with verification
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Button } from '@/components/ui';

interface OtpVerificationProps {
  email: string;
  otp: string[];
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyPress: (index: number, key: string) => void;
  verifying: boolean;
  otpError: string | null;
  isLoading: boolean;
  onResendCode: () => void;
  onChangeEmail: () => void;
}

export function OtpVerification({
  email,
  otp,
  onOtpChange,
  onOtpKeyPress,
  verifying,
  otpError,
  isLoading,
  onResendCode,
  onChangeEmail,
}: OtpVerificationProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    onOtpChange(index, value);

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    onOtpKeyPress(index, key);
  };

  return (
    <View style={styles.emailSent}>
      <Text style={styles.otpTitle}>Enter your code</Text>
      <Text style={styles.otpSubtitle}>
        We sent an 8-digit code to{'\n'}
        <Text style={styles.otpEmail}>{email}</Text>
      </Text>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            style={[
              styles.otpInput,
              digit && styles.otpInputFilled,
              otpError && styles.otpInputError,
            ]}
            value={digit}
            onChangeText={(value) => handleChange(index, value)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!verifying}
            selectTextOnFocus
          />
        ))}
      </View>

      {verifying && (
        <View style={styles.verifyingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.verifyingText}>Verifying...</Text>
        </View>
      )}

      {otpError && <Text style={styles.otpErrorText}>{otpError}</Text>}

      <View style={styles.emailSentActions}>
        <Button
          title="Resend code"
          onPress={onResendCode}
          variant="outline"
          size="md"
          loading={isLoading}
        />
        <Button title="Change email" onPress={onChangeEmail} variant="ghost" size="md" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emailSent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.xl,
  },
  otpTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.light,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  otpEmail: {
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
    width: '100%',
  },
  otpInput: {
    width: 40,
    height: 52,
    backgroundColor: colors.overlay.dark,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.md,
    color: colors.white,
    fontSize: fontSize.xl,
    textAlign: 'center',
    fontWeight: fontWeight.semibold,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  otpInputError: {
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  verifyingText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  otpErrorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailSentActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.sm,
  },
});

