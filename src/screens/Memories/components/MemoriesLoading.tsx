/**
 * Memories Loading State
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, borderRadius } from '@/constants/theme';
import { Skeleton } from '@/components/ui';

export function MemoriesLoading() {
  return (
    <View style={styles.loadingContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton variant="circular" width={40} height={40} />
          <View style={styles.skeletonContent}>
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={120} height={12} style={styles.subtextSkeleton} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    gap: spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: borderRadius.lg,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  subtextSkeleton: {
    marginTop: 6,
  },
});

