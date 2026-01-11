/**
 * Temperature Toggle
 * °C / °F toggle control
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import type { TemperatureUnit } from '@/lib';

interface TemperatureToggleProps {
  value: TemperatureUnit;
  onChange: () => void;
  loading?: boolean;
}

export function TemperatureToggle({ value, onChange, loading }: TemperatureToggleProps) {
  if (loading) {
    return <ActivityIndicator size="small" color={colors.primary} />;
  }

  return (
    <View style={styles.unitToggle}>
      <TouchableOpacity
        style={[styles.unitOption, value === 'celsius' && styles.unitOptionActive]}
        onPress={() => {
          if (value !== 'celsius') {
            onChange();
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.unitOptionText, value === 'celsius' && styles.unitOptionTextActive]}>
          °C
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.unitOption, value === 'fahrenheit' && styles.unitOptionActive]}
        onPress={() => {
          if (value !== 'fahrenheit') {
            onChange();
          }
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.unitOptionText, value === 'fahrenheit' && styles.unitOptionTextActive]}
        >
          °F
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.overlay.light,
    borderRadius: borderRadius.lg,
    padding: 2,
  },
  unitOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  unitOptionActive: {
    backgroundColor: colors.primary,
  },
  unitOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.5)',
  },
  unitOptionTextActive: {
    color: colors.white,
  },
});

