/**
 * Filter Pills
 * Horizontal list of filter options
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

export type FilterType = 'all' | 'photo' | 'video' | 'audio' | 'text';

interface Filter {
  key: FilterType;
  label: string;
  count: number;
}

interface FilterPillsProps {
  filters: Filter[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterPills({ filters, activeFilter, onFilterChange }: FilterPillsProps) {
  const handlePress = (key: FilterType) => {
    hapticClick();
    onFilterChange(key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersList}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterPill, activeFilter === filter.key && styles.filterPillActive]}
            onPress={() => handlePress(filter.key)}
          >
            <Text
              style={[
                styles.filterLabel,
                activeFilter === filter.key && styles.filterLabelActive,
              ]}
            >
              {filter.label}
            </Text>
            <View
              style={[
                styles.filterBadge,
                activeFilter === filter.key && styles.filterBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.filterCount,
                  activeFilter === filter.key && styles.filterCountActive,
                ]}
              >
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  filtersList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.overlay.dark,
  },
  filterPillActive: {
    backgroundColor: 'rgba(249,115,22,0.2)',
  },
  filterLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: fontWeight.medium,
  },
  filterLabelActive: {
    color: colors.primary,
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: colors.primary,
  },
  filterCount: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: fontWeight.semibold,
  },
  filterCountActive: {
    color: colors.white,
  },
});

