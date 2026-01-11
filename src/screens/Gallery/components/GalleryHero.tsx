/**
 * Gallery Hero
 * Journey title, date range, and stats
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Camera, Play, Quote, Sparkles, Info, RefreshCw, Trash2 } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { formatDate, hapticClick } from '@/lib';
import type { Journey } from '@/types';

interface GalleryHeroProps {
  journey: Journey;
  photoCount: number;
  audioCount: number;
  noteCount: number;
  hasExistingRecap: boolean;
  recapLoading: boolean;
  onShowAIInfo: () => void;
  onViewRecap: () => void;
  onGenerateRecap: () => void;
  onDeleteRecap: () => void;
}

export function GalleryHero({
  journey,
  photoCount,
  audioCount,
  noteCount,
  hasExistingRecap,
  recapLoading,
  onShowAIInfo,
  onViewRecap,
  onGenerateRecap,
  onDeleteRecap,
}: GalleryHeroProps) {
  const totalMemories = photoCount + audioCount + noteCount;

  return (
    <View style={styles.hero}>
      <Text style={styles.journeyName}>
        {journey.emoji && `${journey.emoji} `}
        {journey.name}
      </Text>

      <Text style={styles.dateRange}>
        {formatDate(journey.created_at, { month: 'short', day: 'numeric' })} –{' '}
        {formatDate(journey.unlock_date, { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>

      {/* Stats */}
      {totalMemories > 0 && (
        <View style={styles.stats}>
          {photoCount > 0 && (
            <View style={styles.statPill}>
              <Camera size={14} color={colors.primary} />
              <Text style={styles.statValue}>{photoCount}</Text>
            </View>
          )}
          {audioCount > 0 && (
            <View style={styles.statPill}>
              <Play size={14} color={colors.primary} />
              <Text style={styles.statValue}>{audioCount}</Text>
            </View>
          )}
          {noteCount > 0 && (
            <View style={styles.statPill}>
              <Quote size={14} color={colors.primary} />
              <Text style={styles.statValue}>{noteCount}</Text>
            </View>
          )}
        </View>
      )}

      {/* AI Recap Button */}
      {totalMemories > 0 && (
        <View style={styles.recapButtonRow}>
          {!hasExistingRecap && !recapLoading && (
            <TouchableOpacity
              onPress={() => {
                hapticClick();
                onShowAIInfo();
              }}
              activeOpacity={0.7}
              style={styles.aiInfoButton}
              accessibilityLabel="About AI recaps"
              accessibilityRole="button"
            >
              <Info size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={hasExistingRecap ? onViewRecap : onGenerateRecap}
            disabled={recapLoading}
            activeOpacity={0.8}
            style={styles.recapButton}
            accessibilityLabel={hasExistingRecap ? 'View recap' : 'Generate recap'}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.recapButtonGradient}
            >
              <Sparkles
                size={16}
                color={colors.white}
                style={recapLoading ? styles.dimmed : undefined}
              />
              <Text style={[styles.recapButtonText, recapLoading && styles.dimmed]}>
                {recapLoading
                  ? 'Generating...'
                  : hasExistingRecap
                    ? 'View Recap'
                    : 'Generate Recap'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {hasExistingRecap && !recapLoading && (
            <>
              <TouchableOpacity
                onPress={onGenerateRecap}
                activeOpacity={0.7}
                style={styles.recapActionButton}
                accessibilityLabel="Regenerate recap"
                accessibilityRole="button"
              >
                <RefreshCw size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDeleteRecap}
                activeOpacity={0.7}
                style={styles.recapActionButton}
                accessibilityLabel="Delete recap"
                accessibilityRole="button"
              >
                <Trash2 size={16} color="rgba(239,68,68,0.7)" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    paddingTop: 100,
    paddingBottom: spacing.xl,
  },
  journeyName: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.light,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  dateRange: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.xl,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.overlay.light,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  recapButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  aiInfoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.3)',
  },
  recapButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  recapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  recapButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  recapActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.6,
  },
});

