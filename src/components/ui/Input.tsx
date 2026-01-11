/**
 * Input component
 */

import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';

interface InputProps extends TextInputProps {
  /** Label displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Container style overrides */
  containerStyle?: ViewStyle;
  /** Input style overrides */
  inputStyle?: TextStyle;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  accessibilityHint,
  accessibilityLabel,
  ...props
}: InputProps) {
  // Use label as accessibility label if not provided
  const a11yLabel = accessibilityLabel ?? label;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        accessibilityLabel={a11yLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: props.editable === false,
        }}
        {...props}
      />
      {error && (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.overlay.light,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    color: colors.white,
    fontSize: fontSize.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
