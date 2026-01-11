/**
 * Capture Button
 * Main shutter/record button with different states
 */

import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface CaptureButtonProps {
  isRecording?: boolean;
  isVideo?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function CaptureButton({
  isRecording = false,
  isVideo = false,
  loading = false,
  onPress,
}: CaptureButtonProps) {
  if (loading) {
    return (
      <View style={styles.captureButton}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.captureButton, isRecording && styles.recordingCaptureButton]}
      activeOpacity={0.8}
      accessibilityLabel={isRecording ? 'Stop recording' : isVideo ? 'Start recording' : 'Take photo'}
      accessibilityRole="button"
    >
      {isRecording ? (
        <View style={styles.stopIcon} />
      ) : (
        <View style={[styles.captureButtonInner, isVideo && styles.videoButtonInner]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
  videoButtonInner: {
    backgroundColor: colors.error,
  },
  recordingCaptureButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: colors.error,
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});

