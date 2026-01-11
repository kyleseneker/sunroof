/**
 * Audio Memory Display
 * Audio player with visualizer and play/pause controls
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Mic, Play, Pause } from 'lucide-react-native';
import { colors, spacing, fontWeight, borderRadius, fontSize } from '@/constants/theme';
import { formatDuration } from '@/lib';

interface AudioMemoryProps {
  duration?: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function AudioMemory({ duration, isPlaying, onTogglePlay }: AudioMemoryProps) {
  return (
    <View style={styles.audioContainer}>
      {/* Visualizer bars */}
      <View style={styles.audioVisualizer}>
        {[...Array(5)].map((_, i) => (
          <Animated.View
            key={i}
            style={[styles.audioBar, { height: 20 + Math.random() * 40 }]}
          />
        ))}
      </View>

      {/* Mic icon */}
      <LinearGradient
        colors={['rgba(245,158,11,0.3)', 'rgba(234,88,12,0.3)']}
        style={styles.audioIcon}
      >
        <Mic size={32} color={colors.warning} />
      </LinearGradient>

      {/* Play/Pause button */}
      <TouchableOpacity
        onPress={onTogglePlay}
        activeOpacity={0.8}
        accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={isPlaying ? [colors.error, colors.error] : [colors.secondary, colors.primary]}
          style={styles.audioPlayButton}
        >
          {isPlaying ? (
            <Pause size={28} color={colors.white} />
          ) : (
            <Play size={28} color={colors.white} style={styles.playIcon} />
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Duration */}
      {duration && <Text style={styles.audioDuration}>{formatDuration(duration)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  audioVisualizer: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
    opacity: 0.3,
  },
  audioBar: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  audioIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    marginBottom: spacing.lg,
  },
  audioPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playIcon: {
    marginLeft: 3,
  },
  audioDuration: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.light,
    color: colors.white,
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
});

