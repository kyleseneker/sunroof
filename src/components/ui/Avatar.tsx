/**
 * Avatar component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight } from '@/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function Avatar({ src, name, email, size = 'md', style }: AvatarProps) {
  const getSizeStyles = (): { container: ViewStyle; fontSize: number } => {
    switch (size) {
      case 'sm':
        return {
          container: { width: 28, height: 28 },
          fontSize: fontSize.xs,
        };
      case 'lg':
        return {
          container: { width: 48, height: 48 },
          fontSize: fontSize.lg,
        };
      case 'xl':
        return {
          container: { width: 64, height: 64 },
          fontSize: fontSize.xl,
        };
      default:
        return {
          container: { width: 36, height: 36 },
          fontSize: fontSize.sm,
        };
    }
  };

  const getInitials = (): string => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const sizeStyles = getSizeStyles();

  if (src) {
    return (
      <View style={[styles.container, sizeStyles.container, style]}>
        <Image
          source={{ uri: src }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.fallback, sizeStyles.container, style]}>
      <Text style={[styles.initials, { fontSize: sizeStyles.fontSize }]}>
        {getInitials()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: colors.overlay.medium,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grayDark,
  },
  initials: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
});

