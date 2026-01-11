/**
 * Audio Recorder
 * Displays recording UI with timer
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Mic } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import { formatDuration } from '@/lib';

interface AudioRecorderProps {
  isRecording: boolean;
  duration: number;
}

export function AudioRecorder({ isRecording, duration }: AudioRecorderProps) {
  if (isRecording) {
    return (
      <View style={styles.audioContainer}>
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingLabel}>Recording</Text>
        </View>
        <Text style={styles.recordingTime}>{formatDuration(duration)}</Text>
        <Text style={styles.recordingHint}>Tap to stop</Text>
      </View>
    );
  }

  return (
    <View style={styles.audioContainer}>
      <View style={styles.micCircle}>
        <Mic size={40} color={colors.white} />
      </View>
      <Text style={styles.audioHint}>Tap to record</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  audioHint: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  recordingTime: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.normal,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  recordingHint: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
  },
});

