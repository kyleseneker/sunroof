/**
 * Vault Hero
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Archive } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Hero } from '@/components/ui';

interface VaultHeroProps {
  journeyCount: number;
  memoryCount: number;
}

export function VaultHero({ journeyCount, memoryCount }: VaultHeroProps) {
  return (
    <Hero
      icon={<Archive size={32} color={colors.white} />}
      title="Memory Vault"
      subtitle="Your collection of completed journeys"
      titleSize="xl"
      style={styles.hero}
    >
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{journeyCount}</Text>
          <Text style={styles.statLabel}>Journeys</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{memoryCount}</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
      </View>
    </Hero>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.xl * 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.overlay.light,
  },
});
