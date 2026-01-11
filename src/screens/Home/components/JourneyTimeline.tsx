/**
 * Journey Timeline
 * Shows the day-by-day progress of a journey
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface JourneyTimelineProps {
  createdAt: string;
  unlockDate: string;
}

export function JourneyTimeline({ createdAt, unlockDate }: JourneyTimelineProps) {
  const currentDay = Math.max(
    1,
    Math.ceil((Date.now() - new Date(createdAt).getTime()) / MS_PER_DAY)
  );
  const totalDays = Math.max(
    currentDay,
    Math.ceil((new Date(unlockDate).getTime() - new Date(createdAt).getTime()) / MS_PER_DAY)
  );

  return (
    <View style={styles.timelineCard}>
      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>Day {currentDay}</Text>
        <Text style={styles.timelineLabel}>of {totalDays} day journey</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.journeyTimeline}
        style={styles.timelineScroll}
      >
        {Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const isPast = dayNum < currentDay;
          const isCurrent = dayNum === currentDay;
          const isFuture = dayNum > currentDay;

          return (
            <View key={dayNum} style={styles.timelineDay}>
              <View
                style={[
                  styles.timelineDot,
                  isPast && styles.timelineDotPast,
                  isCurrent && styles.timelineDotCurrent,
                  isFuture && styles.timelineDotFuture,
                ]}
              >
                {isPast ? (
                  <CheckCircle size={18} color={colors.primary} />
                ) : isCurrent ? (
                  <Text style={styles.timelineDotCurrentText}>{dayNum}</Text>
                ) : (
                  <Text style={styles.timelineDotFutureText}>{dayNum}</Text>
                )}
              </View>
              {i < totalDays - 1 && (
                <View
                  style={[styles.timelineConnector, isPast && styles.timelineConnectorPast]}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineCard: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  timelineHeader: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timelineLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  timelineScroll: {
    flexGrow: 0,
  },
  journeyTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingVertical: spacing.xs,
  },
  timelineDay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotPast: {
    backgroundColor: 'rgba(249,115,22,0.2)',
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  timelineDotFuture: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timelineDotCurrentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  timelineDotFutureText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.4)',
  },
  timelineConnector: {
    width: 12,
    height: 2,
    backgroundColor: colors.overlay.light,
    marginHorizontal: 2,
  },
  timelineConnectorPast: {
    backgroundColor: 'rgba(249,115,22,0.4)',
  },
});

