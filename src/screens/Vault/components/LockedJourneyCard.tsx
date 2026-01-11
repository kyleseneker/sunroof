/**
 * Locked Journey Card
 * Shows journey that hasn't unlocked yet
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { getTimeUntilUnlock } from '@/lib';
import type { Journey } from '@/types';

interface LockedJourneyCardProps {
  journey: Journey;
}

export function LockedJourneyCard({ journey }: LockedJourneyCardProps) {
  return (
    <View style={styles.lockedCard}>
      <View style={styles.lockedIconContainer}>
        <Lock size={20} color="rgba(255,255,255,0.4)" />
      </View>
      <View style={styles.lockedContent}>
        <View style={styles.lockedHeader}>
          <Text style={styles.lockedEmoji}>{journey.emoji || '🔒'}</Text>
          <Text style={styles.lockedName}>{journey.name}</Text>
        </View>
        <Text style={styles.lockedMeta}>
          Unlocks {journey.unlock_date ? getTimeUntilUnlock(journey.unlock_date) : 'soon'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  lockedIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlay.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  lockedContent: {
    flex: 1,
  },
  lockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  lockedEmoji: {
    fontSize: 18,
  },
  lockedName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  lockedMeta: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 26,
  },
});

