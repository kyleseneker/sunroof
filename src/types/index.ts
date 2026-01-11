/**
 * Core Types for Sunroof App
 */

// Re-export database types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  JourneyRow,
  JourneyInsert,
  JourneyUpdate,
  MemoryRow,
  MemoryInsert,
  MemoryUpdate,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
} from './database';

export interface UserMetadata {
  display_name?: string;
  avatar_url?: string;
  full_name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  created_at?: string;
}

export type JourneyStatus = 'active' | 'completed';

export interface Journey {
  id: string;
  user_id: string;
  name: string;
  destination?: string | null;
  unlock_date: string;
  status: JourneyStatus;
  shared_with?: string[] | null;
  emoji?: string | null;
  cover_image_url?: string | null;
  cover_image_attribution?: string | null;
  deleted_at?: string | null;
  created_at: string;
  memory_count?: number;
  // AI Recap
  ai_recap?: string | null;
  ai_recap_highlights?: string[] | null;
  ai_recap_generated_at?: string | null;
}

export interface MemoryWeather {
  temp: number;
  temperature?: number;
  condition: string;
  icon: string;
  humidity?: number;
}

export interface MemoryLocation {
  latitude: number;
  longitude: number;
  name?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface Memory {
  id: string;
  journey_id: string;
  type: 'photo' | 'video' | 'text' | 'audio';
  url?: string | null;
  photo_url?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  audio_duration?: number | null;
  note?: string | null;
  duration?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  location?: MemoryLocation | null;
  weather?: MemoryWeather | null;
  tags?: string[];
  deleted_at?: string | null;
  created_at: string;
}

export interface AIRecapResponse {
  recap: string | null;
  highlights: string[];
  error?: string;
}

export type CaptureMode = 'photo' | 'video' | 'text' | 'audio';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  AuthCallback: undefined;
  Journey: {
    journey?: Journey;
  };
  Camera: {
    journeyId: string;
    journeyName: string;
    mode?: CaptureMode;
  };
  Gallery: {
    journey: Journey;
  };
  Viewer: {
    memory: Memory;
    memories: Memory[];
    journeyName: string;
    coverImageUrl?: string;
  };
  Vault: undefined;
  Profile: undefined;
  Privacy: undefined;
  Terms: undefined;
  Help: undefined;
  AIRecap: {
    journeyName: string;
    recap: string;
    highlights: string[];
    photoCount: number;
    audioCount: number;
    noteCount: number;
    coverImageUrl?: string | null;
  };
  Memories: {
    journey: Journey;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Vault: undefined;
  Settings: undefined;
};

