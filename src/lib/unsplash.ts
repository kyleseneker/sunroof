/**
 * Unsplash API integration for journey cover images
 */

import Config from 'react-native-config';
import { createLogger } from './logger';

const log = createLogger('Unsplash');

export interface UnsplashPhoto {
  url: string;
  attribution: string;
  photographerName: string;
  photographerUrl: string;
}

interface UnsplashSearchResult {
  results: Array<{
    id: string;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
    };
    user: {
      name: string;
      username: string;
      links: {
        html: string;
      };
    };
    alt_description?: string;
  }>;
  total: number;
}

const UNSPLASH_API_URL = 'https://api.unsplash.com';

// In-memory cache for Unsplash responses
const unsplashCache = new Map<string, { photo: UnsplashPhoto; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL
const MAX_CACHE_SIZE = 50;

/**
 * Search for a location photo on Unsplash
 * Returns a high-quality photo suitable for use as a journey cover
 * Results are cached to reduce API calls
 */
export async function searchLocationPhoto(
  query: string,
  accessKey?: string
): Promise<UnsplashPhoto | null> {
  const key = accessKey || Config.UNSPLASH_ACCESS_KEY;
  
  if (!key) {
    log.warn(' No access key configured');
    return null;
  }

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  const cached = unsplashCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.photo;
  }

  try {
    // Search with location-focused parameters
    const searchParams = new URLSearchParams({
      query: query,
      per_page: '1',
      orientation: 'landscape',
      content_filter: 'high', // Only high-quality, safe images
    });

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?${searchParams}`,
      {
        headers: {
          Authorization: `Client-ID ${key}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      log.error(' API error', { status: response.status, response: text });
      return null;
    }

    const data: UnsplashSearchResult = await response.json();

    if (data.results.length === 0) {
      // No results found - silently return null
      return null;
    }

    const photo = data.results[0];

    // Use the 'regular' size (1080px wide) which is already optimized
    const optimizedUrl = `${photo.urls.regular}&w=1200&q=80`;

    const result: UnsplashPhoto = {
      url: optimizedUrl,
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      photographerName: photo.user.name,
      photographerUrl: photo.user.links.html,
    };

    // Add to cache with LRU eviction
    if (unsplashCache.size >= MAX_CACHE_SIZE) {
      const firstKey = unsplashCache.keys().next().value;
      if (firstKey) {
        unsplashCache.delete(firstKey);
      }
    }
    unsplashCache.set(cacheKey, { photo: result, timestamp: Date.now() });

    log.debug(' Photo found', { query, photographer: result.photographerName });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(' Search error', { error: message, query });
    return null;
  }
}


