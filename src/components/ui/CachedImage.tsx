/**
 * CachedImage
 * Image component with memory and disk caching for improved performance
 */

import React, { useState, useEffect, memo } from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import RNFS from 'react-native-fs';
import { colors } from '@/constants/theme';

// In-memory cache for fast access to recently used images
const memoryCache = new Map<string, string>();
const MAX_MEMORY_CACHE_SIZE = 50;

// Track pending downloads to avoid duplicate requests
const pendingDownloads = new Map<string, Promise<string | null>>();

// Cache directory
const CACHE_DIR = `${RNFS.CachesDirectoryPath}/image_cache`;

// Initialize cache directory
let cacheInitialized = false;
async function ensureCacheDir(): Promise<void> {
  if (cacheInitialized) return;
  try {
    const exists = await RNFS.exists(CACHE_DIR);
    if (!exists) {
      await RNFS.mkdir(CACHE_DIR);
    }
    cacheInitialized = true;
  } catch {
    // Silently fail - will use network images
  }
}

/**
 * Generate a cache key from URL
 */
function getCacheKey(uri: string): string {
  // Simple hash function for filenames
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    const char = uri.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const ext = uri.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
  return `${Math.abs(hash).toString(16)}.${ext}`;
}

/**
 * Get cached image path, downloading if necessary
 */
async function getCachedUri(uri: string): Promise<string | null> {
  if (!uri) return null;

  // Check memory cache first
  const memoryCached = memoryCache.get(uri);
  if (memoryCached) {
    return memoryCached;
  }

  // Check if already downloading
  const pending = pendingDownloads.get(uri);
  if (pending) {
    return pending;
  }

  // Start download process
  const downloadPromise = (async (): Promise<string | null> => {
    try {
      await ensureCacheDir();

      const cacheKey = getCacheKey(uri);
      const cachePath = `${CACHE_DIR}/${cacheKey}`;

      // Check disk cache
      const exists = await RNFS.exists(cachePath);
      if (exists) {
        // Add to memory cache
        addToMemoryCache(uri, `file://${cachePath}`);
        return `file://${cachePath}`;
      }

      // Download to cache
      const result = await RNFS.downloadFile({
        fromUrl: uri,
        toFile: cachePath,
        background: false,
        discretionary: true,
      }).promise;

      if (result.statusCode === 200) {
        const cachedUri = `file://${cachePath}`;
        addToMemoryCache(uri, cachedUri);
        return cachedUri;
      }

      return null;
    } catch {
      return null;
    } finally {
      pendingDownloads.delete(uri);
    }
  })();

  pendingDownloads.set(uri, downloadPromise);
  return downloadPromise;
}

/**
 * Add to memory cache with LRU eviction
 */
function addToMemoryCache(key: string, value: string): void {
  // Evict oldest entries if cache is full
  if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) {
      memoryCache.delete(firstKey);
    }
  }
  memoryCache.set(key, value);
}

interface CachedImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  showLoader?: boolean;
  fallbackColor?: string;
  blurRadius?: number;
}

export const CachedImage = memo(function CachedImage({
  uri,
  style,
  resizeMode = 'cover',
  showLoader = false,
  fallbackColor = colors.grayDark,
  blurRadius,
}: CachedImageProps) {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check memory cache immediately for instant display
    const memoryCached = memoryCache.get(uri);
    if (memoryCached) {
      setCachedUri(memoryCached);
      setLoading(false);
      return;
    }

    // Load from disk cache or network
    getCachedUri(uri).then((cached) => {
      if (mounted) {
        if (cached) {
          setCachedUri(cached);
        } else {
          // Fallback to direct URL if caching fails
          setCachedUri(uri);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [uri]);

  if (loading && showLoader) {
    return (
      <View style={[style, styles.placeholder, { backgroundColor: fallbackColor }]}>
        <ActivityIndicator color={colors.white} size="small" />
      </View>
    );
  }

  if (error || !cachedUri) {
    return <View style={[style, styles.placeholder, { backgroundColor: fallbackColor }]} />;
  }

  return (
    <Image
      source={{ uri: cachedUri }}
      style={style}
      resizeMode={resizeMode}
      blurRadius={blurRadius}
      onError={() => setError(true)}
    />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
