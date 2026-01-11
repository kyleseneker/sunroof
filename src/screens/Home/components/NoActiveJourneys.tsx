/**
 * No Active Journeys State
 * Shown when user has past journeys but no active ones
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Compass, Plus } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

interface NoActiveJourneysProps {
  onCreateJourney: () => void;
}

export function NoActiveJourneys({ onCreateJourney }: NoActiveJourneysProps) {
  return (
    <View style={styles.container}>
      <View style={styles.polaroidStack}>
        <View style={[styles.polaroid, styles.polaroid1]}>
          <View style={[styles.polaroidImage, { backgroundColor: colors.gray }]} />
        </View>
        <View style={[styles.polaroid, styles.polaroid2]}>
          <View style={[styles.polaroidImage, { backgroundColor: colors.gray }]} />
        </View>
        <View style={[styles.polaroid, styles.polaroid3]}>
          <View style={[styles.polaroidImage, { backgroundColor: colors.primary }]}>
            <Compass size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Ready for another adventure?</Text>
      <Text style={styles.subtitle}>Your past journeys await in the vault.</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
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
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.normal,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 300,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
});

