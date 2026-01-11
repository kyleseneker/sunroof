/**
 * Journey data hook with stale-while-revalidate caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchActiveJourneys, fetchPastJourneys } from '@/services';
import {
  getCachedActiveJourneys,
  getCachedPastJourneys,
  setCachedActiveJourneys,
  setCachedPastJourneys,
  invalidateJourneyCache,
  createLogger,
} from '@/lib';
import type { Journey } from '@/types';

const log = createLogger('useJourneys');

interface JourneyData {
  activeJourneys: Journey[];
  pastJourneys: Journey[];
  isLoading: boolean;
  isRefreshing: boolean;
  isRevalidating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  invalidate: () => void;
}

export function useJourneys(userId: string | undefined): JourneyData {
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [pastJourneys, setPastJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we've done initial load
  const initialLoadDone = useRef(false);

  // Fetch from network and update cache
  const fetchFromNetwork = useCallback(async (isBackground = false) => {
    if (!userId) return;

    try {
      const [activeResult, pastResult] = await Promise.all([
        fetchActiveJourneys(userId),
        fetchPastJourneys(userId),
      ]);

      if (activeResult.error) {
        throw new Error(activeResult.error);
      }

      const activeData = activeResult.data || [];
      const pastData = pastResult.data || [];

      // Update cache
      setCachedActiveJourneys(userId, activeData);
      setCachedPastJourneys(userId, pastData);

      // Update state
      setActiveJourneys(activeData);
      setPastJourneys(pastData);
      setError(null);
      
      log.debug(' Fetched journeys', { 
        activeCount: activeData.length, 
        pastCount: pastData.length,
        isBackground,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Fetch error', { error: message, isBackground });
      // Only set error if we don't have cached data to show
      if (!isBackground) {
        setError(err instanceof Error ? err.message : 'Failed to load journeys');
      }
    }
  }, [userId]);

  // Initial load with stale-while-revalidate
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      // Check cache first
      const cachedActive = getCachedActiveJourneys(userId);
      const cachedPast = getCachedPastJourneys(userId);

      // If we have any cached data, show it immediately
      if (cachedActive.data || cachedPast.data) {
        setActiveJourneys(cachedActive.data || []);
        setPastJourneys(cachedPast.data || []);
        setIsLoading(false);
        initialLoadDone.current = true;

        // If data is fresh, we're done
        if (cachedActive.isFresh && cachedPast.isFresh) {
          return;
        }

        // Data is stale - revalidate in background
        setIsRevalidating(true);
        await fetchFromNetwork(true);
        setIsRevalidating(false);
      } else {
        // No cache - fetch from network
        setIsLoading(true);
        await fetchFromNetwork(false);
        setIsLoading(false);
        initialLoadDone.current = true;
      }
    };

    loadData();
  }, [userId, fetchFromNetwork]);

  // Manual refresh (pull-to-refresh)
  const refresh = useCallback(async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    await fetchFromNetwork(false);
    setIsRefreshing(false);
  }, [userId, fetchFromNetwork]);

  // Invalidate cache (force fresh fetch on next load)
  const invalidate = useCallback(() => {
    if (userId) {
      invalidateJourneyCache(userId);
    }
  }, [userId]);

  return {
    activeJourneys,
    pastJourneys,
    isLoading,
    isRefreshing,
    isRevalidating,
    error,
    refresh,
    invalidate,
  };
}
