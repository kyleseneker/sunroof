/**
 * Sign Out Button
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';

interface SignOutButtonProps {
  onPress: () => void;
}

export function SignOutButton({ onPress }: SignOutButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.signOutButton} activeOpacity={0.7}>
      <LogOut size={18} color={colors.white} />
      <Text style={styles.signOutText}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  signOutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});

