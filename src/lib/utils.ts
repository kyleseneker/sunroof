/**
 * Utility functions
 */

import { JOURNEY_GRADIENTS, TimeOfDay, NOTE_PROMPTS } from '@/constants';

/**
 * Format a date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

/**
 * Get time until a journey unlocks
 */
export function getTimeUntilUnlock(unlockDate: string): string {
  const now = new Date();
  const unlock = new Date(unlockDate);
  const diff = unlock.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Check if a journey is unlocked
 */
export function isJourneyUnlocked(journey: { unlock_date: string; status: string }): boolean {
  if (journey.status === 'completed') return true;
  const now = new Date();
  const unlock = new Date(journey.unlock_date);
  return now >= unlock;
}

/**
 * Get current time of day
 */
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get note prompts for current time of day
 */
export function getNotePrompts(): readonly string[] {
  const timeOfDay = getTimeOfDay();
  return NOTE_PROMPTS[timeOfDay];
}

/**
 * Get gradient colors for a journey based on its name
 */
export function getJourneyGradient(name: string): { start: string; end: string } {
  const index = Math.abs(hashString(name)) % JOURNEY_GRADIENTS.length;
  return JOURNEY_GRADIENTS[index];
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Format audio duration (seconds to mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}


