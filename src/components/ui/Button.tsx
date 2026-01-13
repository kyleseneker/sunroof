/**
 * Button component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  AccessibilityState,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight, shadows } from '@/constants/theme';
import { hapticClick } from '@/lib';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** Override spinner color when loading */
  spinnerColor?: string;
  /** Accessibility label - defaults to title if not provided */
  accessibilityLabel?: string;
  /** Accessibility hint describing what happens when pressed */
  accessibilityHint?: string;
  /** Test ID for testing */
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  spinnerColor,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    hapticClick();
    onPress();
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.white,
            ...shadows.lg,
          },
          text: {
            color: colors.grayDark,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.overlay.medium,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          text: {
            color: colors.white,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.white,
          },
          text: {
            color: colors.white,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colors.white,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.error,
          },
          text: {
            color: colors.white,
          },
        };
      case 'accent':
        return {
          container: {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
          text: {
            color: colors.grayDark,
          },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
          },
          text: {
            fontSize: fontSize.sm,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: spacing.md + 2,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.xl,
          },
          text: {
            fontSize: fontSize.lg,
          },
        };
      default:
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.lg,
          },
          text: {
            fontSize: fontSize.md,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const accessibilityState: AccessibilityState = {
    disabled: disabled || loading,
    busy: loading,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      testID={testID}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={spinnerColor ?? variantStyles.text.color}
          size="small"
          accessibilityLabel="Loading"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              icon ? styles.textWithIcon : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
