/**
 * Home Empty State
 * Shown when user has no journeys at all
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, Mic, FileText, Plus } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

interface HomeEmptyStateProps {
  onCreateJourney: () => void;
}

export function HomeEmptyState({ onCreateJourney }: HomeEmptyStateProps) {
  return (
    <View style={styles.emptyContent}>
      <View style={styles.polaroidStack}>
        <View style={[styles.polaroid, styles.polaroid1]}>
          <View style={[styles.polaroidImage, { backgroundColor: colors.gray }]} />
        </View>
        <View style={[styles.polaroid, styles.polaroid2]}>
          <View style={[styles.polaroidImage, { backgroundColor: colors.gray }]} />
        </View>
        <View style={[styles.polaroid, styles.polaroid3]}>
          <View style={[styles.polaroidImage, { backgroundColor: colors.primary }]}>
            <Camera size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </View>

      <Text style={styles.emptyTitle}>Your story starts here</Text>
      <Text style={styles.emptySubtitle}>Capture moments now. Unlock them later.</Text>

      <TouchableOpacity
        onPress={() => {
          hapticClick();
          onCreateJourney();
        }}
        style={styles.startButton}
        activeOpacity={0.9}
        accessibilityLabel="Start a journey"
        accessibilityRole="button"
      >
        <Plus size={20} color={colors.grayDark} />
        <Text style={styles.startButtonText}>Start a Journey</Text>
      </TouchableOpacity>

      <View style={styles.featuresRow}>
        <View style={styles.featureItem}>
          <Camera size={18} color={colors.primary} />
          <Text style={styles.featureLabel}>Photos</Text>
        </View>
        <View style={styles.featureItem}>
          <Mic size={18} color={colors.primary} />
          <Text style={styles.featureLabel}>Voice</Text>
        </View>
        <View style={styles.featureItem}>
          <FileText size={18} color={colors.primary} />
          <Text style={styles.featureLabel}>Notes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  polaroidStack: {
    width: 200,
    height: 200,
    marginBottom: spacing.xl,
  },
  polaroid: {
    position: 'absolute',
    width: 140,
    height: 170,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  polaroid1: {
    transform: [{ rotate: '-8deg' }],
    left: 10,
    top: 10,
  },
  polaroid2: {
    transform: [{ rotate: '5deg' }],
    left: 50,
    top: 0,
  },
  polaroid3: {
    transform: [{ rotate: '-2deg' }],
    left: 30,
    top: 15,
  },
  polaroidImage: {
    flex: 1,
    borderRadius: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.normal,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    marginBottom: spacing.xxl,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.grayDark,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
});

