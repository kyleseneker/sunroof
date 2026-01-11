/**
 * Day Section
 * Collapsible day header with list of memories
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronDown } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { MemoryRow, type MemoryMeta } from './MemoryRow';

interface DaySectionProps {
  dayKey: string;
  dayNumber: number;
  memories: MemoryMeta[];
  isCollapsed: boolean;
  selectedIds: Set<string>;
  isSelecting: boolean;
  onToggleCollapse: (dayKey: string) => void;
  onToggleSelect: (id: string) => void;
  onStartSelecting: (id: string) => void;
  onDeleteMemory: (memory: MemoryMeta) => void;
}

export function DaySection({
  dayKey,
  dayNumber,
  memories,
  isCollapsed,
  selectedIds,
  isSelecting,
  onToggleCollapse,
  onToggleSelect,
  onStartSelecting,
  onDeleteMemory,
}: DaySectionProps) {
  const dayDate = new Date(dayKey);
  const formattedDate = dayDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.daySection}>
      <View style={styles.dayCard}>
        {/* Day Header */}
        <TouchableOpacity
          onPress={() => onToggleCollapse(dayKey)}
          style={styles.dayHeader}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Day {dayNumber}</Text>
          </LinearGradient>
          <View style={styles.dayInfo}>
            <Text style={styles.dayDate}>{formattedDate}</Text>
            <Text style={styles.dayCount}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </Text>
          </View>
          <ChevronDown
            size={20}
            color="rgba(255,255,255,0.6)"
            style={[styles.dayChevron, isCollapsed && styles.dayChevronCollapsed]}
          />
        </TouchableOpacity>

        {/* Day Memories */}
        {!isCollapsed && (
          <View style={styles.dayMemories}>
            {memories.map((memory) => (
              <MemoryRow
                key={memory.id}
                memory={memory}
                isSelected={selectedIds.has(memory.id)}
                isSelecting={isSelecting}
                onToggleSelect={onToggleSelect}
                onLongPress={() => {
                  if (!isSelecting) {
                    onStartSelecting(memory.id);
                  }
                }}
                onDelete={onDeleteMemory}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

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
  dayMemories: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
});

