/**
 * Memory Metadata Display
 * Shows date, time, location, and weather information
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { spacing, borderRadius, fontSize, fontWeight, colors } from '@/constants/theme';
import { formatTemperature, type TemperatureUnit } from '@/lib';
import type { Memory } from '@/types';

interface MemoryMetadataProps {
  memory: Memory;
  temperatureUnit: TemperatureUnit;
}

export function MemoryMetadata({ memory, temperatureUnit }: MemoryMetadataProps) {
  const memoryDate = new Date(memory.created_at);
  const dateStr = memoryDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = memoryDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const temperature = memory.weather?.temp ?? memory.weather?.temperature;

  return (
    <LinearGradient
      colors={['rgba(249,115,22,0.15)', 'rgba(0,0,0,0.5)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.metadataPill}
    >
      <Text style={styles.metadataText}>
        {dateStr} · {timeStr}
        {memory.location_name && ` · ${memory.location_name}`}
        {memory.weather && temperature !== undefined && (
          <Text>
            {' '}
            · {memory.weather.icon} {formatTemperature(temperature, temperatureUnit)}
          </Text>
        )}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  metadataPill: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  metadataText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

