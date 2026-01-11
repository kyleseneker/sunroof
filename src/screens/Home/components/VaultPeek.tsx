/**
 * Vault Peek Button
 * Shows a button to access the memory vault when there are past journeys
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Archive } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

interface VaultPeekProps {
  totalMemoryCount: number;
  onPress: () => void;
}

export function VaultPeek({ totalMemoryCount, onPress }: VaultPeekProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        hapticClick();
        onPress();
      }}
      style={styles.vaultPeek}
      activeOpacity={0.8}
      accessibilityLabel="Open memory vault"
      accessibilityRole="button"
    >
      <Archive size={16} color={colors.primary} />
      <Text style={styles.vaultPeekText}>Memory Vault</Text>
      {totalMemoryCount > 0 && (
        <View style={styles.vaultBadge}>
          <Text style={styles.vaultBadgeText}>{totalMemoryCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  vaultPeek: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.overlay.dark,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  vaultPeekText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  vaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  vaultBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.grayDark,
  },
});

