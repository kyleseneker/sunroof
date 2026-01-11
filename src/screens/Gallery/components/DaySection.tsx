/**
 * Day Section
 * Collapsible day header with memories grid
 */

import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronDown } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { convertTemperature, type TemperatureUnit } from '@/lib';
import type { Memory } from '@/types';

import { MemoryCard } from './MemoryCard';

interface DaySectionProps {
  dayKey: string;
  dayNumber: number;
  memories: Memory[];
  isCollapsed: boolean;
  temperatureUnit: TemperatureUnit;
  isSelecting: boolean;
  selectedMemories: Set<string>;
  onToggleCollapse: () => void;
  onMemoryPress: (memory: Memory) => void;
  onMemoryLongPress: (memoryId: string) => void;
  onToggleSelection: (memoryId: string) => void;
}

export const DaySection = memo(function DaySection({
  dayKey,
  dayNumber,
  memories,
  isCollapsed,
  temperatureUnit,
  isSelecting,
  selectedMemories,
  onToggleCollapse,
  onMemoryPress,
  onMemoryLongPress,
  onToggleSelection,
}: DaySectionProps) {
  const dayDate = new Date(dayKey);
  const formattedDate = dayDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Calculate weather summary - memoized to avoid recalculation on every render
  const { dayWeatherStr } = useMemo(() => {
    const weatherCounts: Record<string, { count: number; icon?: string }> = {};
    const temps: number[] = [];
    memories.forEach((m) => {
      if (m.weather?.condition) {
        const key = m.weather.condition;
        if (!weatherCounts[key]) {
          weatherCounts[key] = { count: 0, icon: m.weather.icon };
        }
        weatherCounts[key].count++;
      }
      const memTemp = m.weather?.temp ?? m.weather?.temperature;
      if (memTemp !== undefined) {
        temps.push(memTemp);
      }
    });
    const mostCommonWeather = Object.entries(weatherCounts).sort(
      (a, b) => b[1].count - a[1].count
    )[0];
    const minTempRaw = temps.length > 0 ? Math.min(...temps) : null;
    const maxTempRaw = temps.length > 0 ? Math.max(...temps) : null;
    const minTemp = minTempRaw !== null ? convertTemperature(minTempRaw, temperatureUnit) : null;
    const maxTemp = maxTempRaw !== null ? convertTemperature(maxTempRaw, temperatureUnit) : null;
    const tempStr =
      minTemp !== null && maxTemp !== null
        ? minTemp === maxTemp
          ? `${minTemp}°`
          : `${minTemp}° - ${maxTemp}°`
        : null;
    const weatherStr = mostCommonWeather
      ? `${mostCommonWeather[1].icon || ''} ${mostCommonWeather[0]}${tempStr ? `, ${tempStr}` : ''}`.trim()
      : null;
    return { dayWeatherStr: weatherStr };
  }, [memories, temperatureUnit]);

  const formatMemoryTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.daySection}>
      <View style={styles.dayCard}>
        {/* Day Header */}
        <TouchableOpacity
          onPress={onToggleCollapse}
          style={styles.dayHeader}
          activeOpacity={0.8}
          accessibilityLabel={`Day ${dayNumber}, ${formattedDate}, ${memories.length} memories`}
          accessibilityRole="button"
          accessibilityState={{ expanded: !isCollapsed }}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Day {dayNumber}</Text>
          </LinearGradient>
          <View style={styles.dayInfo}>
            <Text style={styles.dayDate}>{formattedDate}</Text>
            <Text style={styles.dayCount}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
              {dayWeatherStr && ` · ${dayWeatherStr}`}
            </Text>
          </View>
          <ChevronDown
            size={20}
            color="rgba(255,255,255,0.6)"
            style={[styles.dayChevron, isCollapsed && styles.dayChevronCollapsed]}
          />
        </TouchableOpacity>

        {/* Day Memories Grid */}
        {!isCollapsed && (
          <View style={styles.memoriesGrid}>
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                timeStr={formatMemoryTime(memory.created_at)}
                isSelecting={isSelecting}
                isSelected={selectedMemories.has(memory.id)}
                onPress={() =>
                  isSelecting ? onToggleSelection(memory.id) : onMemoryPress(memory)
                }
                onLongPress={() => onMemoryLongPress(memory.id)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  daySection: {
    marginBottom: spacing.md,
  },
  dayCard: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.overlay.light,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  dayInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  dayDate: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  dayCount: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  dayChevron: {
    marginRight: spacing.xs,
  },
  dayChevronCollapsed: {
    transform: [{ rotate: '-90deg' }],
  },
  memoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});

