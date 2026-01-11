/**
 * Menu Section
 * Container for grouped menu items
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface MenuSectionProps {
  children: React.ReactNode;
}

export function MenuSection({ children }: MenuSectionProps) {
  return <View style={styles.menuSection}>{children}</View>;
}

const styles = StyleSheet.create({
  menuSection: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});

