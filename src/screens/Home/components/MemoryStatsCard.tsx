/**
 * Memory Stats Card
 * Shows the number of captured memories and pending uploads
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

interface MemoryStatsCardProps {
  memoryCount: number;
  pendingCount: number;
  isSyncing: boolean;
  onPress: () => void;
}

export function MemoryStatsCard({
  memoryCount,
  pendingCount,
  isSyncing,
  onPress,
}: MemoryStatsCardProps) {
  const handlePress = () => {
    hapticClick();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.memoryStatsCard}
      activeOpacity={0.7}
      accessibilityLabel={`${memoryCount} memories captured`}
      accessibilityRole="button"
      accessibilityHint="View all memories"
    >
      <View style={styles.memoryStatsIcon}>
        <Sparkles size={20} color={colors.primary} />
      </View>
      <View style={styles.memoryStatsContent}>
        <Text style={styles.memoryStatsNumber}>{memoryCount}</Text>
        <Text style={styles.memoryStatsLabel}>
          {memoryCount === 1 ? 'memory captured' : 'memories captured'}
          {pendingCount > 0 && (
            <Text style={styles.pendingLabel}>
              {' '}
              (+{pendingCount} {isSyncing ? 'syncing' : 'pending'})
            </Text>
          )}
        </Text>
      </View>
      <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  memoryStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: spacing.md,
  },
  memoryStatsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249,115,22,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryStatsContent: {
    flex: 1,
  },
  memoryStatsNumber: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  memoryStatsLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  pendingLabel: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});

