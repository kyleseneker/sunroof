/**
 * AI Services - Generate recaps and other AI-powered features
 */

import { supabase, createLogger } from '@/lib';
import type { ServiceResult } from './types';
import type { Memory, Journey, AIRecapResponse } from '@/types';

const log = createLogger('AIService');

/**
 * Generate an AI recap for a journey and save it to the database
 */
export async function generateJourneyRecap(
  journey: Journey,
  memories: Memory[]
): Promise<ServiceResult<AIRecapResponse>> {
  try {
    // Call the Edge Function to generate the recap
    const { data, error } = await supabase.functions.invoke('generate-recap', {
      body: {
        journeyId: journey.id,
        journeyName: journey.name,
        journeyCreatedAt: journey.created_at,
        journeyUnlockDate: journey.unlock_date,
        memories: memories.map(m => ({
          type: m.type,
          note: m.note,
          created_at: m.created_at,
          location_name: m.location_name,
          weather: m.weather ? {
            condition: m.weather.condition,
            temp: m.weather.temp ?? m.weather.temperature,
            icon: m.weather.icon,
          } : undefined,
        })),
      },
    });

    if (error) {
      log.error(' Recap generation error', {
        error: error.message || 'Function error',
        journeyId: journey.id,
        context: error,
      });
      return { data: null, error: error.message || 'Function error' };
    }

    // Check if data contains an error from the function
    if (data?.error) {
      log.error(' Function returned error', {
        error: data.error,
        journeyId: journey.id,
      });
      return { data: null, error: data.error };
    }

    if (!data?.recap) {
      return { data: null, error: 'Failed to generate recap' };
    }

    // Save the recap to the database
    const { error: updateError } = await supabase
      .from('journeys')
      .update({
        ai_recap: data.recap,
        ai_recap_highlights: data.highlights || [],
        ai_recap_generated_at: new Date().toISOString(),
      })
      .eq('id', journey.id);

    if (updateError) {
      log.warn(' Failed to save recap to database', {
        error: updateError.message,
        journeyId: journey.id,
      });
      // Don't fail the request, still return the recap
    }

    log.info(' Recap generated', {
      journeyId: journey.id,
      memoryCount: memories.length,
      highlightCount: data.highlights?.length || 0,
    });

    return {
      data: {
        recap: data.recap,
        highlights: data.highlights || [],
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Recap exception', { error: message, journeyId: journey.id });
    return { data: null, error: 'Failed to generate recap' };
  }
}

/**
 * Get existing recap for a journey (if one was previously generated)
 */
export async function getJourneyRecap(
  journeyId: string
): Promise<ServiceResult<AIRecapResponse | null>> {
  try {
    const { data, error } = await supabase
      .from('journeys')
      .select('ai_recap, ai_recap_highlights')
      .eq('id', journeyId)
      .single();

    if (error) {
      log.error(' Fetch recap error', { error: error.message, journeyId });
      return { data: null, error: error.message };
    }

    if (!data?.ai_recap) {
      log.debug(' No recap exists yet', { journeyId });
      return { data: null, error: null }; // No recap exists yet
    }

    log.debug(' Recap fetched', { journeyId });
    return {
      data: {
        recap: data.ai_recap,
        highlights: data.ai_recap_highlights || [],
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Fetch recap exception', { error: message, journeyId });
    return { data: null, error: 'Failed to fetch recap' };
  }
}

/**
 * Delete the AI recap for a journey
 */
export async function deleteJourneyRecap(
  journeyId: string
): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase
      .from('journeys')
      .update({
        ai_recap: null,
        ai_recap_highlights: null,
        ai_recap_generated_at: null,
      })
      .eq('id', journeyId);

    if (error) {
      log.error(' Delete recap error', { error: error.message, journeyId });
      return { data: false, error: error.message };
    }

    log.info(' Recap deleted', { journeyId });
    return { data: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Delete recap exception', { error: message, journeyId });
    return { data: false, error: 'Failed to delete recap' };
  }
}
