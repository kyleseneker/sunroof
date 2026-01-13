/**
 * Memories Screen - View and manage journey memories
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Trash2, Lock } from 'lucide-react-native';
import { Background, Header, EmptyState, Hero } from '@/components/ui';
import { Image as ImageIcon } from 'lucide-react-native';
import { useToast } from '@/providers';
import { fetchMemoriesForJourney, deleteMemory } from '@/services';
import { hapticClick, hapticSuccess, hapticError, getJourneyGradient, createLogger } from '@/lib';
import type { RootStackParamList } from '@/types';

const log = createLogger('Memories');

import {
  FilterPills,
  DaySection,
  MemoriesLoading,
  type FilterType,
  type MemoryMeta,
} from './components';

type RouteProps = RouteProp<RootStackParamList, 'Memories'>;

export function MemoriesScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { journey } = route.params;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [memories, setMemories] = useState<MemoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  const gradient = getJourneyGradient(journey.name);

  // Fetch memories
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await fetchMemoriesForJourney(journey.id);
      const metaData: MemoryMeta[] = (data || []).map((m) => ({
        id: m.id,
        type: m.type,
        created_at: m.created_at,
        location_name: m.location_name,
        tags: m.tags,
      }));
      setMemories(metaData);
      setLoading(false);
    };
    load();
  }, [journey.id]);

  // Stats for filter counts
  const stats = useMemo(() => {
    const counts = { photo: 0, video: 0, audio: 0, text: 0 };
    memories.forEach((m) => {
      counts[m.type]++;
    });
    return counts;
  }, [memories]);

  // Filtered memories
  const filteredMemories = useMemo(() => {
    if (activeFilter === 'all') return memories;
    return memories.filter((m) => m.type === activeFilter);
  }, [memories, activeFilter]);

  // Group by day
  const memoriesByDay = useMemo(() => {
    const groups: Record<string, MemoryMeta[]> = {};
    filteredMemories.forEach((m) => {
      const date = new Date(m.created_at);
      const key = date.toISOString().split('T')[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    // Sort memories within each day
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    return groups;
  }, [filteredMemories]);

  const dayKeys = useMemo(() => {
    return Object.keys(memoriesByDay).sort((a, b) => b.localeCompare(a));
  }, [memoriesByDay]);

  // Filter options
  const filters = useMemo(
    () =>
      [
        { key: 'all' as FilterType, label: 'All', count: memories.length },
        { key: 'photo' as FilterType, label: 'Photos', count: stats.photo },
        { key: 'video' as FilterType, label: 'Videos', count: stats.video },
        { key: 'audio' as FilterType, label: 'Audio', count: stats.audio },
        { key: 'text' as FilterType, label: 'Notes', count: stats.text },
      ].filter((f) => f.key === 'all' || f.count > 0),
    [memories.length, stats]
  );

  // Handlers
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleDayCollapse = useCallback((dayKey: string) => {
    hapticClick();
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    hapticClick();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const startSelecting = useCallback((id: string) => {
    setIsSelecting(true);
    setSelectedIds(new Set([id]));
    hapticClick();
  }, []);

  const selectAll = useCallback(() => {
    hapticClick();
    setSelectedIds(new Set(filteredMemories.map((m) => m.id)));
  }, [filteredMemories]);

  const clearSelection = useCallback(() => {
    hapticClick();
    setSelectedIds(new Set());
    setIsSelecting(false);
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    setIsDeleting(true);

    // Delete all memories in parallel
    const results = await Promise.allSettled(Array.from(selectedIds).map((id) => deleteMemory(id)));

    const successCount = results.filter((r) => r.status === 'fulfilled' && !r.value.error).length;

    const failedCount = results.length - successCount;
    if (failedCount > 0) {
      log.error('Some deletes failed', { failed: failedCount, total: results.length });
    }

    if (successCount > 0) {
      setMemories((prev) => prev.filter((m) => !selectedIds.has(m.id)));
      hapticSuccess();
    } else {
      hapticError();
      showToast('Failed to delete memories', 'error');
    }

    setSelectedIds(new Set());
    setIsSelecting(false);
    setIsDeleting(false);
  }, [selectedIds, showToast]);

  const confirmDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'memory' : 'memories'}?`,
      "These will be permanently deleted. You won't be able to recover them.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteSelected,
        },
      ]
    );
  }, [selectedIds.size, handleDeleteSelected]);

  const confirmDeleteSingle = useCallback(
    (memory: MemoryMeta) => {
      const typeLabel =
        memory.type === 'photo'
          ? 'photo'
          : memory.type === 'video'
            ? 'video'
            : memory.type === 'audio'
              ? 'audio'
              : 'note';

      Alert.alert('Delete this memory?', `This ${typeLabel} will be permanently deleted.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await deleteMemory(memory.id);
              if (error) throw new Error(error);
              setMemories((prev) => prev.filter((m) => m.id !== memory.id));
              hapticSuccess();
            } catch (err) {
              hapticError();
              showToast('Failed to delete memory', 'error');
            }
          },
        },
      ]);
    },
    [showToast]
  );

  return (
    <View style={styles.container}>
      <Background
        imageUrl={journey.cover_image_url}
        gradient={[gradient.start, gradient.end]}
        blurRadius={20}
      />

      {/* Header */}
      <Header
        paddingTop={insets.top + spacing.md}
        onLeftPress={handleBack}
        isSelecting={isSelecting}
        onCancelSelection={clearSelection}
        selectionActions={
          <>
            <TouchableOpacity onPress={selectAll} style={styles.selectAllBtn}>
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmDeleteSelected}
              style={[
                styles.actionButton,
                styles.deleteButton,
                selectedIds.size === 0 && styles.actionButtonDisabled,
              ]}
              disabled={selectedIds.size === 0 || isDeleting}
            >
              <Trash2
                size={18}
                color={selectedIds.size > 0 ? colors.error : 'rgba(255,255,255,0.3)'}
              />
            </TouchableOpacity>
          </>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Hero
          icon={<ImageIcon size={32} color={colors.white} />}
          title="Memories"
          subtitle={journey.emoji ? `${journey.emoji} ${journey.name}` : journey.name}
        />

        {/* Filters */}
        {!loading && memories.length > 0 && (
          <FilterPills
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}

        {/* Content */}
        {loading ? (
          <MemoriesLoading />
        ) : filteredMemories.length === 0 ? (
          <View style={styles.emptyCard}>
            <EmptyState
              icon={<Lock size={32} color="rgba(255,255,255,0.4)" />}
              title="No memories yet"
              description={
                activeFilter !== 'all'
                  ? `No ${activeFilter}s captured for this journey`
                  : 'Start capturing memories for this journey'
              }
            />
          </View>
        ) : (
          <View style={styles.timeline}>
            {dayKeys.map((dayKey, dayIndex) => (
              <DaySection
                key={dayKey}
                dayKey={dayKey}
                dayNumber={dayKeys.length - dayIndex}
                memories={memoriesByDay[dayKey]}
                isCollapsed={collapsedDays.has(dayKey)}
                selectedIds={selectedIds}
                isSelecting={isSelecting}
                onToggleCollapse={toggleDayCollapse}
                onToggleSelect={toggleSelect}
                onStartSelecting={startSelecting}
                onDeleteMemory={confirmDeleteSingle}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientEnd,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  timeline: {
    gap: spacing.lg,
  },
  selectAllBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  actionButtonDisabled: {
    backgroundColor: colors.overlay.dark,
  },
  emptyCard: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light,
  },
});
