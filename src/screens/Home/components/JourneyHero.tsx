/**
 * Journey Hero Section
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Compass, UserPlus } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Hero } from '@/components/ui';
import type { Journey } from '@/types';

interface JourneyHeroProps {
  journey: Journey;
  isOwner: boolean;
}

export function JourneyHero({ journey, isOwner }: JourneyHeroProps) {
  const icon = journey.emoji ? (
    <Text style={styles.emoji}>{journey.emoji}</Text>
  ) : (
    <Compass size={32} color={colors.white} />
  );

  return (
    <Hero
      icon={icon}
      title={journey.name}
      subtitle={journey.destination || undefined}
      titleSize="xl"
    >
      {!isOwner && (
        <View style={styles.sharedBadge}>
          <UserPlus size={12} color={colors.primary} />
          <Text style={styles.sharedBadgeText}>Shared with you</Text>
        </View>
      )}
    </Hero>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 32,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.overlay.dark,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  sharedBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
});
