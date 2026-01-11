/**
 * Home Screen
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import BootSplash from 'react-native-bootsplash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pencil, Trash2, CheckCircle, ImageIcon, Archive } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { MAX_ACTIVE_JOURNEYS } from '@/constants';
import { Background, Pagination } from '@/components/ui';
import { ActionSheet } from '@/components/features';
import { useAuth, useToast, useOffline } from '@/providers';
import { fetchActiveJourneys, fetchPastJourneys, deleteJourney, updateJourney } from '@/services';
import {
  getJourneyGradient,
  hapticClick,
  createLogger,
  getCachedActiveJourneys,
  getCachedPastJourneys,
  setCachedActiveJourneys,
  setCachedPastJourneys,
  getLastFetchTime,
} from '@/lib';
import type { Journey, RootStackParamList, CaptureMode } from '@/types';

const log = createLogger('Home');

import {
  HomeHeader,
  JourneyHero,
  JourneyTimeline,
  CountdownCard,
  MemoryStatsCard,
  CaptureButtons,
  HomeEmptyState,
  NoActiveJourneys,
  VaultPeek,
} from './components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// DEBUG: Set to true to see empty state
const DEBUG_FORCE_EMPTY_STATE = false;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { pendingCount, isSyncing, getPendingForJourney } = useOffline();

  // State
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [pastJourneys, setPastJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [journeyPendingCount, setJourneyPendingCount] = useState(0);
  const [isRefreshingAfterSync, setIsRefreshingAfterSync] = useState(false);

  // Refs
  const syncJustFinishedRef = useRef(false);
  const maxPendingDuringSyncRef = useRef(0);
  const prevSyncingRef = useRef(isSyncing);

  // Adjust currentIndex if out of bounds (e.g., after deletion)
  useEffect(() => {
    if (activeJourneys.length > 0 && currentIndex >= activeJourneys.length) {
      setCurrentIndex(activeJourneys.length - 1);
    }
  }, [activeJourneys.length, currentIndex]);

  // Derived state
  const currentJourney = activeJourneys[currentIndex] || null;
  const canCreateJourney = activeJourneys.length < MAX_ACTIVE_JOURNEYS;
  const isOwner = (journey: Journey) => journey.user_id === user?.id;
  const totalPastMemoryCount = pastJourneys.reduce((acc, j) => acc + (j.memory_count || 0), 0);

  // Track pending memories for current journey
  useEffect(() => {
    if (syncJustFinishedRef.current) return;

    if (currentJourney?.id) {
      getPendingForJourney(currentJourney.id).then((pending) => {
        const newCount = pending.length;

        if (isSyncing) {
          if (newCount > maxPendingDuringSyncRef.current) {
            maxPendingDuringSyncRef.current = newCount;
            setJourneyPendingCount(newCount);
          }
        } else {
          maxPendingDuringSyncRef.current = newCount;
          setJourneyPendingCount(newCount);
        }
      });
    } else {
      setJourneyPendingCount(0);
      maxPendingDuringSyncRef.current = 0;
    }
  }, [currentJourney?.id, pendingCount, isSyncing, getPendingForJourney]);

  // Execute pending action after ActionSheet closes
  useEffect(() => {
    if (!showActionSheet && pendingAction) {
      const timer = setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showActionSheet, pendingAction]);

  // Load journeys from network and update cache
  const loadJourneys = useCallback(async (force = false) => {
    if (!user?.id) return;

    // Skip if data is fresh (less than 30 seconds old) and not forced
    if (!force) {
      const lastFetch = getLastFetchTime(user.id);
      if (lastFetch && Date.now() - lastFetch < 30000) {
        // Data is fresh, just ensure we're not loading
        setIsLoading(false);
        setRefreshing(false);
        BootSplash.hide({ fade: true });
        return;
      }
    }

    try {
      const [activeResult, pastResult] = await Promise.all([
        fetchActiveJourneys(user.id),
        fetchPastJourneys(user.id),
      ]);

      if (activeResult.data) {
        setActiveJourneys(activeResult.data);
        setCachedActiveJourneys(user.id, activeResult.data);
      }
      if (pastResult.data) {
        setPastJourneys(pastResult.data);
        setCachedPastJourneys(user.id, pastResult.data);
      }
    } catch (error) {
      log.error('Load journeys error', { error });
      showToast('Failed to load journeys', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      // Hide splash screen once home data is loaded
      BootSplash.hide({ fade: true });
    }
  }, [user?.id, showToast]);

  // Initial load - use cache if available
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Check cache first for instant display
    const cachedActive = getCachedActiveJourneys(user.id);
    const cachedPast = getCachedPastJourneys(user.id);

    if (cachedActive.data || cachedPast.data) {
      setActiveJourneys(cachedActive.data || []);
      setPastJourneys(cachedPast.data || []);
      setIsLoading(false);
      BootSplash.hide({ fade: true });

      // If data is fresh, skip network fetch
      if (cachedActive.isFresh && cachedPast.isFresh) {
        return;
      }
    }

    // Fetch from network (or if no cache)
    loadJourneys();
  }, [user?.id, loadJourneys]);

  // On focus - only refetch if data might be stale
  useFocusEffect(
    useCallback(() => {
      // loadJourneys will check freshness internally
      loadJourneys();
    }, [loadJourneys])
  );

  // Reload journeys when sync finishes
  useEffect(() => {
    if (prevSyncingRef.current && !isSyncing) {
      log.debug('Sync completed, refreshing journeys');
      setIsRefreshingAfterSync(true);
      loadJourneys(true).then(() => {
        setJourneyPendingCount(0);
        setIsRefreshingAfterSync(false);
        syncJustFinishedRef.current = false;
        maxPendingDuringSyncRef.current = 0;
      });
    }
    prevSyncingRef.current = isSyncing;
  }, [isSyncing, loadJourneys]);

  // Handlers
  const onRefresh = () => {
    setRefreshing(true);
    loadJourneys(true); // Force refresh on pull-to-refresh
  };

  const handleCapture = (mode: CaptureMode) => {
    if (!currentJourney) return;
    hapticClick();
    navigation.navigate('Camera', {
      journeyId: currentJourney.id,
      journeyName: currentJourney.name,
      mode,
    });
  };

  const handleViewMemories = () => {
    if (!currentJourney) return;
    navigation.navigate('Memories', { journey: currentJourney });
  };

  const confirmDeleteJourney = (journey: Journey) => {
    Alert.alert(
      'Delete Journey?',
      `Are you sure you want to delete "${journey.name}"? This will also delete all memories in this journey.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteJourney(journey.id);
            if (error) {
              showToast('Failed to delete journey', 'error');
            } else {
              loadJourneys(true); // Force refresh after deletion
            }
          },
        },
      ]
    );
  };

  const handleEndJourney = async () => {
    if (!currentJourney) return;

    const { error } = await updateJourney({
      id: currentJourney.id,
      unlockDate: new Date().toISOString(),
    });

    if (error) {
      showToast('Failed to end journey', 'error');
    } else {
      showToast('Journey ended! Memories unlocked.', 'success');
      loadJourneys(true); // Force refresh after ending journey
    }
  };

  // Swipe gesture for switching between journeys
  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .onEnd((event) => {
          if (activeJourneys.length <= 1) return;
          
          const { translationX, velocityX } = event;
          const swipeThreshold = 50;
          const velocityThreshold = 500;
          
          // Swipe left (next journey)
          if (translationX < -swipeThreshold || velocityX < -velocityThreshold) {
            if (currentIndex < activeJourneys.length - 1) {
              setCurrentIndex(currentIndex + 1);
            }
          }
          // Swipe right (previous journey)
          else if (translationX > swipeThreshold || velocityX > velocityThreshold) {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            }
          }
        }),
    [activeJourneys.length, currentIndex]
  );

  // Keep showing native splash while loading
  if (isLoading) {
    return null;
  }

  // Empty state - no journeys at all
  if (DEBUG_FORCE_EMPTY_STATE || (activeJourneys.length === 0 && pastJourneys.length === 0)) {
    return (
      <View style={styles.container}>
        <Background unsplashQuery="warm sunset mountain landscape" />
        <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
          <HomeHeader
            user={user}
            canCreateJourney={true}
            hasCurrentJourney={false}
            onProfilePress={() => navigation.navigate('Profile')}
            onCreatePress={() => navigation.navigate('Journey', {})}
            onOptionsPress={() => {}}
          />
          <HomeEmptyState onCreateJourney={() => navigation.navigate('Journey', {})} />
        </View>
      </View>
    );
  }

  // Main view
  return (
    <View style={styles.container}>
      <Background
        imageUrl={currentJourney?.cover_image_url}
        unsplashQuery={!currentJourney ? 'warm sunset mountain landscape' : undefined}
        gradient={currentJourney ? [getJourneyGradient(currentJourney.name).start, getJourneyGradient(currentJourney.name).end] : undefined}
      />

      <GestureDetector gesture={swipeGesture}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />
          }
        >
          <HomeHeader
            user={user}
            canCreateJourney={canCreateJourney}
            hasCurrentJourney={!!currentJourney}
            onProfilePress={() => navigation.navigate('Profile')}
            onCreatePress={() => navigation.navigate('Journey', {})}
            onOptionsPress={() => setShowActionSheet(true)}
          />

          <View style={styles.mainContent}>
            {currentJourney ? (
              <>
                <JourneyHero journey={currentJourney} isOwner={isOwner(currentJourney)} />
                <JourneyTimeline
                  createdAt={currentJourney.created_at}
                  unlockDate={currentJourney.unlock_date}
                />
                <CountdownCard unlockDate={currentJourney.unlock_date} />
                <MemoryStatsCard
                  memoryCount={currentJourney.memory_count ?? 0}
                  pendingCount={journeyPendingCount}
                  isSyncing={isSyncing || isRefreshingAfterSync}
                  onPress={handleViewMemories}
                />
                <CaptureButtons onCapture={handleCapture} />
                <View style={styles.pagination}>
                  <Pagination
                    count={activeJourneys.length}
                    currentIndex={currentIndex}
                    onIndexChange={setCurrentIndex}
                  />
                </View>
              </>
            ) : (
              <NoActiveJourneys onCreateJourney={() => navigation.navigate('Journey', {})} />
            )}
          </View>

          {!currentJourney && pastJourneys.length > 0 && (
            <VaultPeek
              totalMemoryCount={totalPastMemoryCount}
              onPress={() => navigation.navigate('Vault')}
            />
          )}
        </ScrollView>
      </GestureDetector>

      {/* Modals */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        options={[
          {
            label: 'Edit Journey',
            icon: <Pencil size={20} color={colors.white} />,
            onPress: () => {
              const journey = currentJourney;
              if (journey) {
                setPendingAction(() => () => navigation.navigate('Journey', { journey }));
              }
            },
          },
          {
            label: 'Memories',
            icon: <ImageIcon size={20} color={colors.white} />,
            onPress: () => {
              if (currentJourney) {
                setPendingAction(
                  () => () => navigation.navigate('Memories', { journey: currentJourney })
                );
              }
            },
          },
          ...(pastJourneys.length > 0
            ? [
                {
                  label: 'Memory Vault',
                  icon: <Archive size={20} color={colors.white} />,
                  onPress: () => {
                    setPendingAction(() => () => navigation.navigate('Vault'));
                  },
                },
              ]
            : []),
          {
            label: 'End Journey Now',
            icon: <CheckCircle size={20} color={colors.white} />,
            onPress: () => {
              setPendingAction(() => handleEndJourney);
            },
          },
          {
            label: 'Delete Journey',
            icon: <Trash2 size={20} color={colors.error} />,
            onPress: () => {
              const journey = currentJourney;
              setPendingAction(() => () => {
                if (journey) confirmDeleteJourney(journey);
              });
            },
            variant: 'danger',
          },
        ]}
      />

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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pagination: {
    marginTop: spacing.md,
  },
});

