/**
 * Menu Item
 * Reusable settings menu item
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  loading?: boolean;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

export function MenuItem({
  icon,
  label,
  onPress,
  loading,
  danger,
  rightElement,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      disabled={loading || !onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, danger && styles.menuIconContainerDanger]}>
          {icon}
        </View>
        <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>{label}</Text>
      </View>
      {rightElement ? (
        rightElement
      ) : loading ? (
        <ActivityIndicator size="small" color={danger ? colors.error : 'rgba(255,255,255,0.4)'} />
      ) : onPress ? (
        <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(249,115,22,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconContainerDanger: {
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  menuItemText: {
    fontSize: fontSize.md,
    color: colors.white,
  },
  menuItemTextDanger: {
    color: colors.error,
  },
});

