/**
 * Icon Button component
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

type IconButtonVariant = 'ghost' | 'filled' | 'bordered';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const handlePress = () => {
    if (disabled) return;
    hapticClick();
    onPress();
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.overlay.medium,
        };
      case 'bordered':
        return {
          backgroundColor: colors.overlay.light,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          width: 32,
          height: 32,
          borderRadius: borderRadius.md,
        };
      case 'lg':
        return {
          width: 48,
          height: 48,
          borderRadius: borderRadius.lg,
        };
      default:
        return {
          width: 40,
          height: 40,
          borderRadius: borderRadius.md,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.container,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

