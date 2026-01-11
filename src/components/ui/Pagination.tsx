/**
 * Pagination Component
 * Reusable dots/progress indicator for carousels
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing } from '@/constants/theme';

interface PaginationProps {
  count: number;
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  maxDots?: number;
}

export function Pagination({
  count,
  currentIndex,
  onIndexChange,
  maxDots = 12,
}: PaginationProps) {
  if (count <= 1) {
    return null;
  }

  const handlePress = (index: number) => {
    if (onIndexChange) {
      onIndexChange(index);
    }
  };

  // Use dots for small counts
  if (count <= maxDots) {
    return (
      <View style={styles.container}>
        {Array.from({ length: count }, (_, i) => {
          const isActive = i === currentIndex;
          const dot = (
            <View style={[styles.dot, isActive && styles.dotActive]} />
          );

          if (onIndexChange) {
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handlePress(i)}
                accessibilityLabel={`Item ${i + 1} of ${count}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                {dot}
              </TouchableOpacity>
            );
          }

          return <View key={i}>{dot}</View>;
        })}
      </View>
    );
  }

  // Progress bar for many items
  const progress = ((currentIndex + 1) / count) * 100;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.overlay.light,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
