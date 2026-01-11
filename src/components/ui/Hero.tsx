/**
 * Hero Component
 * Reusable hero section with gradient icon, title, and subtitle
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';

const titleSizes: Record<'md' | 'lg' | 'xl', TextStyle> = {
  md: { fontSize: fontSize.xl },
  lg: { fontSize: fontSize['2xl'] },
  xl: { fontSize: fontSize['3xl'] },
};

interface HeroProps {
  /** Icon to display in the gradient circle */
  icon: ReactNode;
  /** Main title text */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Additional content below the subtitle (stats, badges, etc.) */
  children?: ReactNode;
  /** Custom style for the container */
  style?: ViewStyle;
  /** Size of the icon circle */
  iconSize?: 'md' | 'lg';
  /** Title size variant */
  titleSize?: 'md' | 'lg' | 'xl';
}

export function Hero({
  icon,
  title,
  subtitle,
  children,
  style,
  iconSize = 'lg',
  titleSize = 'lg',
}: HeroProps) {
  const iconDimensions = iconSize === 'lg' ? 72 : 56;

  return (
    <View style={[styles.hero, style]}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={[
            styles.iconGradient,
            {
              width: iconDimensions,
              height: iconDimensions,
              borderRadius: iconDimensions / 2,
            },
          ]}
        >
          {icon}
        </LinearGradient>
      </View>

      <Text style={[styles.title, titleSizes[titleSize]]}>{title}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  iconGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
