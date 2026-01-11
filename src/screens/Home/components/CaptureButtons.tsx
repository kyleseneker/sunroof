/**
 * Capture Buttons
 * Photo, Video, Audio, and Note capture buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Camera, Video, Mic, FileText } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import type { CaptureMode } from '@/types';

interface CaptureButtonsProps {
  onCapture: (mode: CaptureMode) => void;
}

interface CaptureButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function CaptureButton({ icon, label, onPress }: CaptureButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.captureButton}
      activeOpacity={0.8}
      accessibilityLabel={`Capture ${label.toLowerCase()}`}
      accessibilityRole="button"
    >
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.captureButtonFilled}>
        {icon}
      </LinearGradient>
      <Text style={styles.captureButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CaptureButtons({ onCapture }: CaptureButtonsProps) {
  return (
    <View style={styles.captureButtons}>
      <CaptureButton
        icon={<Camera size={22} color={colors.white} />}
        label="Photo"
        onPress={() => onCapture('photo')}
      />
      <CaptureButton
        icon={<Video size={22} color={colors.white} />}
        label="Video"
        onPress={() => onCapture('video')}
      />
      <CaptureButton
        icon={<Mic size={22} color={colors.white} />}
        label="Audio"
        onPress={() => onCapture('audio')}
      />
      <CaptureButton
        icon={<FileText size={22} color={colors.white} />}
        label="Note"
        onPress={() => onCapture('text')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  captureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  captureButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  captureButtonFilled: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: fontWeight.medium,
  },
});

