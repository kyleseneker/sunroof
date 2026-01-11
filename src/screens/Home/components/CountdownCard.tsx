/**
 * Countdown Card
 * Shows time remaining until journey unlocks
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { getTimeUntilUnlock } from '@/lib';

interface CountdownCardProps {
  unlockDate: string;
}

export function CountdownCard({ unlockDate }: CountdownCardProps) {
  return (
    <View style={styles.countdownCard}>
      <View style={styles.countdownIcon}>
        <Lock size={20} color={colors.primary} />
      </View>
      <View style={styles.countdownContent}>
        <Text style={styles.countdownTime}>{getTimeUntilUnlock(unlockDate)}</Text>
        <Text style={styles.countdownLabel}>until unlock</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: spacing.md,
  },
  countdownIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249,115,22,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownContent: {
    flex: 1,
  },
  countdownTime: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  countdownLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

