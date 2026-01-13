/**
 * Journey Card
 * Unlocked journey with cover image
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Sparkles, Calendar } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { formatDate, hapticClick } from '@/lib';
import type { Journey } from '@/types';

interface JourneyCardProps {
  journey: Journey;
  onPress: () => void;
  isFirst?: boolean;
}

export function JourneyCard({ journey, onPress, isFirst }: JourneyCardProps) {
  const handlePress = () => {
    hapticClick();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.journeyCardWrapper, isFirst && styles.journeyCardFirst]}
    >
      <View style={styles.journeyCard}>
        {journey.cover_image_url ? (
          <Image
            source={{ uri: journey.cover_image_url }}
            style={styles.journeyImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.journeyImage}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.journeyGradient}
        />
        <View style={styles.journeyContent}>
          <View style={styles.journeyTop}>
            {journey.ai_recap && (
              <View style={styles.recapBadge}>
                <Sparkles size={12} color={colors.primary} />
              </View>
            )}
            <View style={styles.journeyBadge}>
              <Text style={styles.journeyBadgeText}>
                {journey.memory_count || 0}{' '}
                {(journey.memory_count || 0) === 1 ? 'memory' : 'memories'}
              </Text>
            </View>
          </View>
          <View style={styles.journeyBottom}>
            <Text style={styles.journeyEmoji}>{journey.emoji || '📸'}</Text>
            <Text style={styles.journeyName}>{journey.name}</Text>
            {journey.created_at && journey.unlock_date && (
              <View style={styles.journeyMeta}>
                <Calendar size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.journeyDate}>
                  {formatDate(journey.created_at, { month: 'short', day: 'numeric' })} –{' '}
                  {formatDate(journey.unlock_date, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  journeyCardWrapper: {
    marginBottom: spacing.md,
  },
  journeyCardFirst: {
    marginTop: spacing.xs,
  },
  journeyCard: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.overlay.light,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  journeyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  journeyGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  journeyContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  journeyTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  recapBadge: {
    backgroundColor: colors.overlay.dark,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.3)',
  },
  journeyBadge: {
    backgroundColor: colors.overlay.dark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  journeyBottom: {
    gap: spacing.xs,
  },
  journeyEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  journeyName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  journeyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  journeyDate: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
});
