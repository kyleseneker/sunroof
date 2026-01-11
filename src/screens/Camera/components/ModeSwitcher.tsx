/**
 * Mode Switcher
 * Toggle between Photo, Video, Audio, and Text modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, Video, Mic, FileText } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';
import type { CaptureMode } from '@/types';

interface ModeSwitcherProps {
  currentMode: CaptureMode;
  onModeChange: (mode: CaptureMode) => void;
}

const MODES: { mode: CaptureMode; label: string; Icon: typeof Camera }[] = [
  { mode: 'photo', label: 'Photo', Icon: Camera },
  { mode: 'video', label: 'Video', Icon: Video },
  { mode: 'audio', label: 'Audio', Icon: Mic },
  { mode: 'text', label: 'Note', Icon: FileText },
];

export function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  const handleModePress = (mode: CaptureMode) => {
    hapticClick();
    onModeChange(mode);
  };

  return (
    <View style={styles.modeSwitcher}>
      {MODES.map(({ mode, label, Icon }) => (
        <TouchableOpacity
          key={mode}
          onPress={() => handleModePress(mode)}
          style={[styles.modeButton, currentMode === mode && styles.modeButtonActive]}
          accessibilityLabel={`Switch to ${label} mode`}
          accessibilityRole="button"
          accessibilityState={{ selected: currentMode === mode }}
        >
          <Icon size={16} color={colors.white} />
          <Text style={styles.modeButtonText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  modeSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  modeButtonActive: {
    backgroundColor: colors.overlay.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modeButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

