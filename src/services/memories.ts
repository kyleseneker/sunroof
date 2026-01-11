/**
 * Memory Service
 */

import { supabase, createLogger } from '@/lib';
import type { Memory } from '@/types';
import type { ServiceResult } from './types';

const log = createLogger('MemoryService');

export interface CreateMemoryInput {
  journeyId: string;
  type: 'photo' | 'video' | 'note' | 'audio';
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  duration?: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  weather?: {
    temp: number;
    condition: string;
    icon: string;
    humidity?: number;
  };
  tags?: string[];
}

/**
 * Create a new memory (photo, video, note, or audio)
 */
export async function createMemory(input: CreateMemoryInput): Promise<ServiceResult<Memory>> {
  try {
    // Map type 'note' to database type 'text'
    const dbType = input.type === 'note' ? 'text' : input.type;
    
    // Determine URL based on type
    let url: string | undefined;
    if (input.type === 'audio') {
      url = input.audioUrl;
    } else if (input.type === 'video') {
      url = input.videoUrl;
    } else {
      url = input.imageUrl;
    }
    
    const { data, error } = await supabase
      .from('memories')
      .insert([{
        journey_id: input.journeyId,
        type: dbType,
        note: input.content || null,
        url: url || null,
        duration: input.duration || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        location_name: input.locationName || null,
        weather: input.weather || null,
        tags: input.tags || [],
      }])
      .select()
      .single();

    if (error) {
      log.error(' Create error', { error: error.message, journeyId: input.journeyId });
      return { data: null, error: error.message };
    }

    log.debug(' Memory created', { memoryId: data.id, type: input.type, journeyId: input.journeyId });
    return { data: data as Memory, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Create exception', { error: message, journeyId: input.journeyId });
    return { data: null, error: 'Failed to create memory' };
  }
}

/**
 * Extract storage path from a storage URL
 */
function extractStoragePath(url: string): string | null {
  try {
    const match = url.match(/\/sunroof-media\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Delete a single memory (including storage file if applicable)
 */
export async function deleteMemory(memoryId: string): Promise<ServiceResult<boolean>> {
  try {
    // First, fetch the memory to get its URL (for storage cleanup)
    const { data: memory, error: fetchError } = await supabase
      .from('memories')
      .select('url, type')
      .eq('id', memoryId)
      .single();

    if (fetchError) {
      log.warn(' Fetch for delete error', { error: fetchError.message, memoryId });
    }

    // Delete the storage file if it exists (for photo/video/audio types)
    if (memory?.url && (memory.type === 'photo' || memory.type === 'video' || memory.type === 'audio')) {
      const storagePath = extractStoragePath(memory.url);
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('sunroof-media')
          .remove([storagePath]);

        if (storageError) {
          log.warn(' Storage delete error', { error: storageError.message, memoryId });
        } else {
          log.debug(' Storage file deleted', { memoryId, storagePath });
        }
      }
    }

    // Delete the database record
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (error) {
      log.error(' Delete error', { error: error.message, memoryId });
      return { data: null, error: error.message };
    }

    log.debug(' Memory deleted', { memoryId });
    return { data: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Delete exception', { error: message, memoryId });
    return { data: null, error: 'Failed to delete memory' };
  }
}

/**
 * Fetch all memories for a journey
 */
export async function fetchMemoriesForJourney(journeyId: string): Promise<ServiceResult<Memory[]>> {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('journey_id', journeyId)
      .order('created_at', { ascending: true });

    if (error) {
      log.error(' Fetch error', { error: error.message, journeyId });
      return { data: null, error: error.message };
    }

    log.debug(' Fetched memories', { journeyId, count: data?.length || 0 });
    return { data: (data || []) as Memory[], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Fetch exception', { error: message, journeyId });
    return { data: null, error: 'Failed to fetch memories' };
  }
}

/**
 * Add a tag to a memory
 */
export async function addTagToMemory(memoryId: string, tag: string): Promise<ServiceResult<string[]>> {
  try {
    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) {
      return { data: null, error: 'Tag cannot be empty' };
    }

    // Fetch current tags
    const { data: memory, error: fetchError } = await supabase
      .from('memories')
      .select('tags')
      .eq('id', memoryId)
      .single();

    if (fetchError) {
      log.error(' Fetch tags error', { error: fetchError.message, memoryId });
      return { data: null, error: fetchError.message };
    }

    const currentTags: string[] = memory?.tags || [];
    
    // Check if tag already exists
    if (currentTags.includes(normalizedTag)) {
      return { data: currentTags, error: null };
    }

    const updatedTags = [...currentTags, normalizedTag];

    const { error: updateError } = await supabase
      .from('memories')
      .update({ tags: updatedTags })
      .eq('id', memoryId);

    if (updateError) {
      log.error(' Update tags error', { error: updateError.message, memoryId });
      return { data: null, error: updateError.message };
    }

    log.debug(' Tag added', { memoryId, tag: normalizedTag });
    return { data: updatedTags, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Add tag exception', { error: message, memoryId });
    return { data: null, error: 'Failed to add tag' };
  }
}

/**
 * Remove a tag from a memory
 */
export async function removeTagFromMemory(memoryId: string, tag: string): Promise<ServiceResult<string[]>> {
  try {
    const normalizedTag = tag.trim().toLowerCase();

    // Fetch current tags
    const { data: memory, error: fetchError } = await supabase
      .from('memories')
      .select('tags')
      .eq('id', memoryId)
      .single();

    if (fetchError) {
      log.error(' Fetch tags for removal error', { error: fetchError.message, memoryId });
      return { data: null, error: fetchError.message };
    }

    const currentTags: string[] = memory?.tags || [];
    const updatedTags = currentTags.filter(t => t !== normalizedTag);

    const { error: updateError } = await supabase
      .from('memories')
      .update({ tags: updatedTags })
      .eq('id', memoryId);

    if (updateError) {
      log.error(' Update tags error', { error: updateError.message, memoryId });
      return { data: null, error: updateError.message };
    }

    log.debug(' Tag removed', { memoryId, tag: normalizedTag });
    return { data: updatedTags, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Remove tag exception', { error: message, memoryId });
    return { data: null, error: 'Failed to remove tag' };
  }
}

/**
 * Get all unique tags used in a journey's memories
 */
export async function getJourneyTags(journeyId: string): Promise<ServiceResult<string[]>> {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('tags')
      .eq('journey_id', journeyId)
      .not('tags', 'is', null);

    if (error) {
      log.error(' Fetch journey tags error', { error: error.message, journeyId });
      return { data: null, error: error.message };
    }

    // Flatten and dedupe tags
    const allTags = (data || []).flatMap(m => m.tags || []);
    const uniqueTags = [...new Set(allTags)].sort();

    log.debug(' Fetched journey tags', { journeyId, tagCount: uniqueTags.length });
    return { data: uniqueTags, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Fetch journey tags exception', { error: message, journeyId });
    return { data: null, error: 'Failed to fetch tags' };
  }
}

