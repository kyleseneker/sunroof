/**
 * Vault Screen - View completed journeys
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '@/constants/theme';
import { Archive } from 'lucide-react-native';
import { Background, Header, EmptyState } from '@/components/ui';
import { useAuth } from '@/providers';
import { fetchPastJourneys } from '@/services';
import { isJourneyUnlocked, createLogger } from '@/lib';
import type { Journey, RootStackParamList } from '@/types';

const log = createLogger('Vault');

import {
  VaultHero,
  JourneyCard,
  LockedJourneyCard,
  VaultSection,
} from './components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function VaultScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJourneys = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await fetchPastJourneys(user.id);
      if (!error && data) {
        setJourneys(data);
        log.debug(' Loaded journeys', { count: data.length });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Load error', { error: message });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Reload journeys when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadJourneys();
    }, [loadJourneys])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJourneys();
    setRefreshing(false);
  }, [loadJourneys]);

  const handleViewGallery = useCallback(
    (journey: Journey) => {
      navigation.navigate('Gallery', { journey });
    },
    [navigation]
  );

  const totalMemories = journeys.reduce((acc, j) => acc + (j.memory_count || 0), 0);
  const unlockedJourneys = journeys.filter(
    (j) => j.unlock_date && j.status && isJourneyUnlocked(j)
  );
  const lockedJourneys = journeys.filter(
    (j) => j.unlock_date && j.status && !isJourneyUnlocked(j)
  );

  return (
    <View style={styles.container}>
      <Background unsplashQuery="warm sunset mountain landscape" />
      <Header paddingTop={insets.top} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <VaultHero journeyCount={journeys.length} memoryCount={totalMemories} />

        {/* Unlocked journeys */}
        {unlockedJourneys.length > 0 && (
          <VaultSection title="Ready to Explore">
            {unlockedJourneys.map((journey, index) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                onPress={() => handleViewGallery(journey)}
                isFirst={index === 0}
              />
            ))}
          </VaultSection>
        )}

        {/* Locked journeys */}
        {lockedJourneys.length > 0 && (
          <VaultSection title="Still Locked" isLocked>
            {lockedJourneys.map((journey) => (
              <LockedJourneyCard key={journey.id} journey={journey} />
            ))}
          </VaultSection>
        )}

        {/* Empty state */}
        {journeys.length === 0 && !isLoading && (
          <EmptyState
            icon={<Archive size={40} color="rgba(255,255,255,0.4)" />}
            title="No memories yet"
            description="Complete a journey to unlock your first collection of memories"
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
});

