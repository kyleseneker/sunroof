/**
 * App constants
 */

// =============================================================================
// APP CONFIGURATION
// =============================================================================

export const APP_NAME = 'Sunroof';
export const APP_VERSION = '1.0.0';

// =============================================================================
// LIMITS & CONSTRAINTS
// =============================================================================

export const MAX_ACTIVE_JOURNEYS = 5;
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB (Supabase limit)
export const MAX_NOTE_LENGTH = 10000;
export const MAX_AUDIO_DURATION = 300; // 5 minutes
export const MAX_AUDIO_DURATION_SECONDS = 300; // 5 minutes (alias)
export const MAX_TAG_LENGTH = 30;
export const MAX_TAGS_PER_MEMORY = 10;
export const MAX_JOURNEY_NAME_LENGTH = 100;
export const MAX_DESTINATION_LENGTH = 200;

export const IMAGE_COMPRESSION = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
};

// =============================================================================
// STORAGE
// =============================================================================

export const STORAGE_BUCKET = 'sunroof-media';

export const STORAGE_PATHS = {
  memories: (userId: string, journeyId: string) => `${userId}/${journeyId}`,
} as const;

// =============================================================================
// ANIMATION DURATIONS (in ms)
// =============================================================================

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  page: 300,
} as const;

// =============================================================================
// UI DIMENSIONS
// =============================================================================

export const DIMENSIONS = {
  headerHeight: 56,
  tabBarHeight: 64,
  buttonMinHeight: 48,
  inputHeight: 48,
  avatarSizeSm: 32,
  avatarSizeMd: 48,
  avatarSizeLg: 72,
  cardBorderRadius: 16,
  journeyCardHeight: 180,
  memoryThumbnailSize: 100,
} as const;

// =============================================================================
// TIME-BASED NOTE PROMPTS
// =============================================================================

export const NOTE_PROMPTS = {
  morning: [
    "Today I'm looking forward to...",
    'This morning feels...',
    'The first thing I noticed was...',
  ],
  afternoon: ['Right now I\'m...', 'The best part so far has been...', 'This moment is...'],
  evening: ["Today was special because...", "I'm grateful for...", 'A moment worth remembering...'],
  night: [
    "Tonight I'm thinking about...",
    "What I'll remember about today is...",
    'Right now I feel...',
  ],
} as const;

export type TimeOfDay = keyof typeof NOTE_PROMPTS;

// =============================================================================
// ERROR & SUCCESS MESSAGES
// =============================================================================

export const ErrorMessages = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Please check your internet connection.',
  UNAUTHORIZED: 'Please sign in to continue.',
  NOT_FOUND: 'Not found.',
  DELETE_FAILED: (item: string) => `Failed to delete ${item}. Please try again.`,
  SAVE_FAILED: (item: string) => `Failed to save ${item}. Please try again.`,
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  CAMERA_PERMISSION: 'Camera permission is required to take photos.',
  LOCATION_PERMISSION: 'Location permission is required for weather data.',
  AUDIO_PERMISSION: 'Microphone permission is required to record audio.',
  VALIDATION: {
    REQUIRED: (field: string) => `${field} is required`,
    MIN_LENGTH: (field: string, min: number) =>
      `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field: string, max: number) =>
      `${field} must be no more than ${max} characters`,
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_DATE: 'Please enter a valid date',
    FUTURE_DATE_REQUIRED: 'Date must be in the future',
  },
} as const;

export const SuccessMessages = {
  SAVED: (item: string) => `${item} saved successfully!`,
  DELETED: (item: string) => `${item} deleted.`,
  UPDATED: (item: string) => `${item} updated.`,
  COPIED: 'Copied to clipboard!',
} as const;

// =============================================================================
// JOURNEY GRADIENTS (for backgrounds when no cover image)
// =============================================================================

export const JOURNEY_GRADIENTS = [
  { start: '#f59e0b', end: '#ea580c' }, // Amber to Orange
  { start: '#10b981', end: '#0891b2' }, // Emerald to Cyan
  { start: '#8b5cf6', end: '#ec4899' }, // Violet to Pink
  { start: '#3b82f6', end: '#6366f1' }, // Blue to Indigo
  { start: '#f43f5e', end: '#f97316' }, // Rose to Orange
  { start: '#14b8a6', end: '#22c55e' }, // Teal to Green
] as const;

// =============================================================================
// PHOTO FILTERS
// =============================================================================

// Note: These use CSS filter syntax for web compatibility
// In React Native, you'd use react-native-image-filter-kit or similar
export const PHOTO_FILTERS = {
  none: { name: 'Original', filter: '' },
  warm: { name: 'Warm', filter: 'sepia(20%) saturate(120%)' },
  cool: { name: 'Cool', filter: 'hue-rotate(20deg) saturate(90%)' },
  vintage: { name: 'Vintage', filter: 'sepia(40%) contrast(90%)' },
  bw: { name: 'B&W', filter: 'grayscale(100%)' },
  vivid: { name: 'Vivid', filter: 'saturate(150%) contrast(110%)' },
  fade: { name: 'Fade', filter: 'contrast(90%) brightness(105%)' },
  noir: { name: 'Noir', filter: 'grayscale(100%) contrast(120%)' },
} as const;

export type PhotoFilterKey = keyof typeof PHOTO_FILTERS;

// =============================================================================
// REGEX PATTERNS
// =============================================================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  TAG: /^[a-zA-Z0-9_-]+$/,
} as const;

// =============================================================================
// DATE/TIME FORMATS
// =============================================================================

export const DATE_FORMAT = {
  display: 'MMM d, yyyy',
  displayWithTime: 'MMM d, yyyy h:mm a',
  short: 'M/d/yy',
  api: 'yyyy-MM-dd',
  time: 'h:mm a',
} as const;

// =============================================================================
// ASYNC STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  onboardingComplete: 'sunroof_onboarding_complete',
  temperatureUnit: 'sunroof_temperature_unit',
  notificationsEnabled: 'sunroof_notifications_enabled',
  lastSyncTimestamp: 'sunroof_last_sync',
  pendingUploads: 'sunroof_pending_uploads',
} as const;
