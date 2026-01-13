/**
 * Gallery Screen
 * View memories for a journey (Day-by-Day Story format)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pencil,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Plus,
  MoreVertical,
} from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Camera } from 'lucide-react-native';
import { Modal, Button, Input, Background, Header, IconButton, EmptyState } from '@/components/ui';
import { ActionSheet } from '@/components/features';
import { useAuth, useToast } from '@/providers';
import {
  fetchMemoriesForJourney,
  deleteJourney,
  generateJourneyRecap,
  getJourneyRecap,
  deleteJourneyRecap,
  deleteMemory,
  addTagToMemory,
} from '@/services';
import {
  getJourneyGradient,
  hapticClick,
  hapticSuccess,
  hapticError,
  getPreference,
  createLogger,
  type TemperatureUnit,
} from '@/lib';
import type { Memory, RootStackParamList, AIRecapResponse } from '@/types';

const log = createLogger('Gallery');

import { GalleryHero, DaySection } from './components';

type GalleryRouteProp = RouteProp<RootStackParamList, 'Gallery'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Group memories by day
function groupMemoriesByDay(memories: Memory[]): Record<string, Memory[]> {
  const groups: Record<string, Memory[]> = {};

  memories.forEach((memory) => {
    const date = new Date(memory.created_at);
    const dayKey = date.toISOString().split('T')[0];

    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(memory);
  });

  // Sort each day's memories by time
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

  return groups;
}

export function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GalleryRouteProp>();
  const { journey: initialJourney } = route.params;
  const { user } = useAuth();
  const { showToast } = useToast();

  // Journey & memories state
  const [journey, _setJourney] = useState(initialJourney);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('fahrenheit');
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  // UI state
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showAIInfoModal, setShowAIInfoModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Recap state
  const [recapLoading, setRecapLoading] = useState(false);
  const [hasExistingRecap, setHasExistingRecap] = useState(false);
  const [existingRecap, setExistingRecap] = useState<AIRecapResponse | null>(null);

  // Multi-select state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMemories, setSelectedMemories] = useState<Set<string>>(new Set());
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  // Bulk tagging state
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [isAddingBulkTag, setIsAddingBulkTag] = useState(false);

  const isOwner = journey.user_id === user?.id;

  // Memoized data
  const memoriesByDay = useMemo(() => groupMemoriesByDay(memories), [memories]);
  const dayKeys = useMemo(
    () => Object.keys(memoriesByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [memoriesByDay]
  );
  const firstDayDate = dayKeys.length > 0 ? new Date(dayKeys[0]) : null;

  // Stats
  const photoCount = memories.filter((m) => m.type === 'photo').length;
  const audioCount = memories.filter((m) => m.type === 'audio').length;
  const noteCount = memories.filter((m) => m.type === 'text').length;

  const gradient = getJourneyGradient(journey.name);

  // Load memories
  const loadMemories = useCallback(async () => {
    try {
      const { data, error } = await fetchMemoriesForJourney(journey.id);
      if (error) {
        showToast('Failed to load memories', 'error');
        return;
      }
      setMemories(data || []);
    } catch (err) {
      log.error(' Load error', { error: err });
      showToast('Failed to load memories', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [journey.id, showToast]);

  useEffect(() => {
    loadMemories();
    getPreference('temperatureUnit').then(setTemperatureUnit);
  }, [loadMemories]);

  // Check for existing recap
  useEffect(() => {
    const checkExistingRecap = async () => {
      if (journey.ai_recap) {
        setHasExistingRecap(true);
        setExistingRecap({
          recap: journey.ai_recap,
          highlights: journey.ai_recap_highlights || [],
        });
      } else {
        const { data } = await getJourneyRecap(journey.id);
        if (data?.recap) {
          setHasExistingRecap(true);
          setExistingRecap(data);
        }
      }
    };
    checkExistingRecap();
  }, [journey.id, journey.ai_recap, journey.ai_recap_highlights]);

  // Navigation
  const handleClose = () => {
    hapticClick();
    navigation.goBack();
  };

  // Day collapse
  const toggleDayCollapse = (dayKey: string) => {
    hapticClick();
    setCollapsedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayKey)) {
        newSet.delete(dayKey);
      } else {
        newSet.add(dayKey);
      }
      return newSet;
    });
  };

  // Delete journey
  const confirmDeleteJourney = () => {
    Alert.alert(
      'Delete Journey?',
      `Are you sure you want to delete "${journey.name}"? This will also delete all memories in this journey.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteJourney,
        },
      ]
    );
  };

  const handleDeleteJourney = async () => {
    if (!user?.id || isDeleting) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteJourney(journey.id);
      if (error) {
        showToast('Failed to delete journey', 'error');
        return;
      }
      navigation.goBack();
    } catch (err) {
      log.error(' Delete error', { error: err });
      showToast('Failed to delete journey', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // AI Recap
  const viewExistingRecap = () => {
    if (!existingRecap || !existingRecap.recap) return;
    hapticClick();
    navigation.navigate('AIRecap', {
      journeyName: journey.name,
      recap: existingRecap.recap,
      highlights: existingRecap.highlights,
      photoCount,
      audioCount,
      noteCount,
      coverImageUrl: journey.cover_image_url,
    });
  };

  const generateNewRecap = async () => {
    setRecapLoading(true);
    try {
      const { data, error } = await generateJourneyRecap(journey, memories);
      if (error || !data || !data.recap) {
        hapticError();
        showToast(error || 'Failed to generate recap', 'error');
        return;
      }

      setHasExistingRecap(true);
      setExistingRecap(data);

      hapticSuccess();
      navigation.navigate('AIRecap', {
        journeyName: journey.name,
        recap: data.recap,
        highlights: data.highlights,
        photoCount,
        audioCount,
        noteCount,
        coverImageUrl: journey.cover_image_url,
      });
    } catch (err) {
      log.error(' Recap error', { error: err });
      hapticError();
      showToast('Failed to generate recap', 'error');
    } finally {
      setRecapLoading(false);
    }
  };

  const handleDeleteRecap = async () => {
    hapticClick();
    setRecapLoading(true);
    try {
      const { error } = await deleteJourneyRecap(journey.id);
      if (error) {
        hapticError();
        showToast('Failed to delete recap', 'error');
        return;
      }
      setHasExistingRecap(false);
      setExistingRecap(null);
      hapticSuccess();
    } catch (err) {
      log.error(' Delete recap error', { error: err });
      hapticError();
      showToast('Failed to delete recap', 'error');
    } finally {
      setRecapLoading(false);
    }
  };

  // Open viewer
  const openViewer = (memory: Memory) => {
    hapticClick();
    navigation.navigate('Viewer', {
      memory,
      memories,
      journeyName: journey.name,
      coverImageUrl: journey.cover_image_url ?? undefined,
    });
  };

  // Multi-select
  const toggleSelectMode = () => {
    hapticClick();
    if (isSelecting) {
      setSelectedMemories(new Set());
    }
    setIsSelecting(!isSelecting);
  };

  const toggleMemorySelection = (memoryId: string) => {
    hapticClick();
    setSelectedMemories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memoryId)) {
        newSet.delete(memoryId);
      } else {
        newSet.add(memoryId);
      }
      return newSet;
    });
  };

  const confirmDeleteSelected = () => {
    const count = selectedMemories.size;
    Alert.alert(
      `Delete ${count} ${count === 1 ? 'Memory' : 'Memories'}?`,
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteSelected,
        },
      ]
    );
  };

  const handleDeleteSelected = async () => {
    if (isDeletingSelected) return;

    setIsDeletingSelected(true);
    try {
      const deletePromises = Array.from(selectedMemories).map((id) => deleteMemory(id));
      await Promise.all(deletePromises);

      setMemories((prev) => prev.filter((m) => !selectedMemories.has(m.id)));
      setSelectedMemories(new Set());
      setIsSelecting(false);

      hapticSuccess();
      showToast(`Deleted ${selectedMemories.size} memories`, 'success');
    } catch (err) {
      log.error(' Bulk delete error', { error: err });
      hapticError();
      showToast('Failed to delete some memories', 'error');
    } finally {
      setIsDeletingSelected(false);
    }
  };

  // Bulk tagging
  const handleAddBulkTag = async () => {
    if (!bulkTagInput.trim() || selectedMemories.size === 0 || isAddingBulkTag) return;

    setIsAddingBulkTag(true);
    try {
      const tagPromises = Array.from(selectedMemories).map((id) =>
        addTagToMemory(id, bulkTagInput.trim())
      );
      await Promise.all(tagPromises);

      const tag = bulkTagInput.trim();
      setMemories((prev) =>
        prev.map((m) => {
          if (selectedMemories.has(m.id)) {
            const existingTags = m.tags || [];
            if (!existingTags.includes(tag)) {
              return { ...m, tags: [...existingTags, tag] };
            }
          }
          return m;
        })
      );

      setBulkTagInput('');
      setShowBulkTagModal(false);
      setSelectedMemories(new Set());
      setIsSelecting(false);

      hapticSuccess();
    } catch (err) {
      log.error(' Bulk tag error', { error: err });
      hapticError();
      showToast('Failed to add tag to some memories', 'error');
    } finally {
      setIsAddingBulkTag(false);
    }
  };

  const handleMemoryLongPress = (memoryId: string) => {
    if (!isSelecting) {
      setIsSelecting(true);
      toggleMemorySelection(memoryId);
    }
  };

  // Prepare data for FlatList - combines hero and day sections
  type ListItem =
    | { type: 'hero' }
    | { type: 'day'; dayKey: string; dayNumber: number; memories: Memory[] };

  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = [{ type: 'hero' }];
    dayKeys.forEach((dayKey, dayIndex) => {
      const dayDate = new Date(dayKey);
      const dayNumber = firstDayDate
        ? Math.abs(
            Math.floor((dayDate.getTime() - firstDayDate.getTime()) / (1000 * 60 * 60 * 24))
          ) + 1
        : dayIndex + 1;
      items.push({
        type: 'day',
        dayKey,
        dayNumber,
        memories: memoriesByDay[dayKey],
      });
    });
    return items;
  }, [dayKeys, firstDayDate, memoriesByDay]);

  const renderListItem: ListRenderItem<ListItem> = useCallback(
    ({ item }) => {
      if (item.type === 'hero') {
        return (
          <GalleryHero
            journey={journey}
            photoCount={photoCount}
            audioCount={audioCount}
            noteCount={noteCount}
            hasExistingRecap={hasExistingRecap}
            recapLoading={recapLoading}
            onShowAIInfo={() => setShowAIInfoModal(true)}
            onViewRecap={viewExistingRecap}
            onGenerateRecap={generateNewRecap}
            onDeleteRecap={handleDeleteRecap}
          />
        );
      }

      return (
        <DaySection
          dayKey={item.dayKey}
          dayNumber={item.dayNumber}
          memories={item.memories}
          isCollapsed={collapsedDays.has(item.dayKey)}
          temperatureUnit={temperatureUnit}
          isSelecting={isSelecting}
          selectedMemories={selectedMemories}
          onToggleCollapse={() => toggleDayCollapse(item.dayKey)}
          onMemoryPress={openViewer}
          onMemoryLongPress={handleMemoryLongPress}
          onToggleSelection={toggleMemorySelection}
        />
      );
    },
    [
      journey,
      photoCount,
      audioCount,
      noteCount,
      hasExistingRecap,
      recapLoading,
      viewExistingRecap,
      generateNewRecap,
      handleDeleteRecap,
      collapsedDays,
      temperatureUnit,
      isSelecting,
      selectedMemories,
      toggleDayCollapse,
      openViewer,
      handleMemoryLongPress,
      toggleMemorySelection,
    ]
  );

  const keyExtractor = useCallback((item: ListItem) => {
    if (item.type === 'hero') return 'hero';
    return `day-${item.dayKey}`;
  }, []);

  return (
    <View style={styles.container}>
      <Background
        imageUrl={journey.cover_image_url}
        gradient={[gradient.start, gradient.end]}
        blurRadius={20}
      />

      {/* Header */}
      <Header
        paddingTop={insets.top}
        absolute
        onLeftPress={handleClose}
        isSelecting={isSelecting}
        onCancelSelection={toggleSelectMode}
        rightContent={
          isOwner ? (
            <IconButton
              icon={<MoreVertical size={20} color={colors.white} />}
              onPress={() => setShowActionSheet(true)}
              accessibilityLabel="Journey options"
              variant="ghost"
            />
          ) : undefined
        }
        selectionActions={
          <>
            <TouchableOpacity
              onPress={() => {
                hapticClick();
                setShowBulkTagModal(true);
              }}
              disabled={selectedMemories.size === 0}
              style={[
                styles.selectionActionButton,
                selectedMemories.size === 0 && styles.selectionActionButtonDisabled,
              ]}
              accessibilityLabel="Tag selected memories"
              accessibilityRole="button"
            >
              <Tag
                size={18}
                color={selectedMemories.size > 0 ? colors.primary : 'rgba(255,255,255,0.3)'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmDeleteSelected}
              disabled={selectedMemories.size === 0 || isDeletingSelected}
              style={[
                styles.selectionActionButton,
                (selectedMemories.size === 0 || isDeletingSelected) &&
                  styles.selectionActionButtonDisabled,
              ]}
              accessibilityLabel="Delete selected memories"
              accessibilityRole="button"
            >
              <Trash2
                size={18}
                color={selectedMemories.size > 0 ? colors.error : 'rgba(255,255,255,0.3)'}
              />
            </TouchableOpacity>
          </>
        }
      />

      {isLoading ? (
        <View style={[styles.loadingContainer, { paddingTop: 200 }]}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      ) : memories.length === 0 ? (
        <View
          style={[
            styles.scrollContent,
            { paddingTop: 160, paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <GalleryHero
            journey={journey}
            photoCount={photoCount}
            audioCount={audioCount}
            noteCount={noteCount}
            hasExistingRecap={hasExistingRecap}
            recapLoading={recapLoading}
            onShowAIInfo={() => setShowAIInfoModal(true)}
            onViewRecap={viewExistingRecap}
            onGenerateRecap={generateNewRecap}
            onDeleteRecap={handleDeleteRecap}
          />
          <EmptyState
            icon={<Camera size={40} color="rgba(255,255,255,0.4)" />}
            title="No memories yet"
            description="Start capturing your story"
          />
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderListItem}
          keyExtractor={keyExtractor}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={7}
          initialNumToRender={3}
        />
      )}

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={journey.name}
        options={[
          {
            label: 'Select Memories',
            icon: <CheckCircle2 size={20} color={colors.white} />,
            onPress: () => {
              setShowActionSheet(false);
              setTimeout(() => setIsSelecting(true), 300);
            },
          },
          {
            label: 'Edit Journey',
            icon: <Pencil size={20} color={colors.white} />,
            onPress: () => {
              setShowActionSheet(false);
              setTimeout(() => navigation.navigate('Journey', { journey }), 300);
            },
          },
          {
            label: 'Delete Journey',
            icon: <Trash2 size={20} color={colors.error} />,
            onPress: () => {
              setShowActionSheet(false);
              setTimeout(() => confirmDeleteJourney(), 300);
            },
            variant: 'danger',
          },
        ]}
      />

      {/* AI Info Modal */}
      <Modal
        visible={showAIInfoModal}
        onClose={() => setShowAIInfoModal(false)}
        title="About AI Recaps"
        variant="gradient"
      >
        <Text style={styles.aiModalSubtitle}>
          Generate a personalized summary of your journey using AI.
        </Text>

        <View style={styles.aiModalSection}>
          <View style={styles.aiModalSectionHeader}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={styles.aiModalSectionTitle}>Privacy & Security</Text>
          </View>
          <View style={styles.aiModalBullets}>
            <Text style={styles.aiModalBullet}>• Photos and audio are never sent to AI</Text>
            <Text style={styles.aiModalBullet}>• Only text notes and metadata are used</Text>
            <Text style={styles.aiModalBullet}>• Powered by OpenAI, saved to your account</Text>
            <Text style={styles.aiModalBullet}>• Regenerate or delete anytime</Text>
          </View>
        </View>

        <Button title="Got it" onPress={() => setShowAIInfoModal(false)} fullWidth size="lg" />
      </Modal>

      {/* Bulk Tag Modal */}
      <Modal
        visible={showBulkTagModal}
        onClose={() => {
          setShowBulkTagModal(false);
          setBulkTagInput('');
        }}
        title="Add Tag"
        variant="gradient"
      >
        <Text style={styles.bulkTagSubtitle}>
          Add a tag to {selectedMemories.size} selected{' '}
          {selectedMemories.size === 1 ? 'memory' : 'memories'}.
        </Text>

        <View style={styles.bulkTagSection}>
          <View style={styles.bulkTagSectionHeader}>
            <Tag size={16} color={colors.primary} />
            <Text style={styles.bulkTagSectionTitle}>Tag Name</Text>
          </View>
          <View style={styles.bulkTagInputRow}>
            <View style={styles.bulkTagInputWrapper}>
              <Input
                value={bulkTagInput}
                onChangeText={setBulkTagInput}
                placeholder="Enter tag name..."
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleAddBulkTag}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.bulkTagAddButton,
                (!bulkTagInput.trim() || isAddingBulkTag) && styles.bulkTagAddButtonDisabled,
              ]}
              onPress={handleAddBulkTag}
              disabled={!bulkTagInput.trim() || isAddingBulkTag}
              activeOpacity={0.7}
              accessibilityLabel="Add tag"
              accessibilityRole="button"
            >
              {isAddingBulkTag ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Plus size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Cancel"
          onPress={() => {
            setShowBulkTagModal(false);
            setBulkTagInput('');
          }}
          variant="secondary"
          fullWidth
          size="lg"
        />
      </Modal>
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
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // AI Info Modal
  aiModalSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  aiModalSection: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  aiModalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  aiModalSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  aiModalBullets: {
    gap: spacing.xs,
  },
  aiModalBullet: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  // Bulk Tag Modal
  bulkTagSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  bulkTagSection: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  bulkTagSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  bulkTagSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  bulkTagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  bulkTagInputWrapper: {
    flex: 1,
  },
  bulkTagAddButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkTagAddButtonDisabled: {
    backgroundColor: colors.overlay.medium,
  },
  selectionActionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionActionButtonDisabled: {
    backgroundColor: colors.overlay.dark,
  },
});
