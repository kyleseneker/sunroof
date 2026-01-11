/**
 * Badge component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const getVariantStyles = (): { bg: string; text: string } => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.2)', text: colors.success };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: colors.error };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: colors.warning };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.2)', text: colors.info };
      default:
        return { bg: colors.overlay.medium, text: colors.white };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, { backgroundColor: variantStyles.bg }, style]}>
      <Text style={[styles.text, { color: variantStyles.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});

