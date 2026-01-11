/**
 * Login Hero
 * Logo, app name, and tagline
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';

export function LoginHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Image source={require('../../../../assets/icon-transparent.png')} style={styles.logoIcon} />
        </LinearGradient>
      </View>
      <Text style={styles.appName}>Sunroof</Text>
      <Text style={styles.tagline}>Capture now. Relive later.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 56,
    height: 56,
  },
  appName: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.light,
    color: colors.white,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
  },
});

