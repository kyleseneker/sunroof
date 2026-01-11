/**
 * Journey Screen
 * Create or edit a journey
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Plus, Compass, Check, Pencil } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Background, Header, Button, Hero, EmojiSelector } from '@/components/ui';
import { useAuth, useToast } from '@/providers';
import { createJourney, updateJourney, inviteCollaborator } from '@/services';
import {
  hapticSuccess,
  hapticError,
  hapticClick,
  searchLocationPhoto,
  scheduleJourneyUnlockNotification,
  invalidateJourneyCache,
  createLogger,
} from '@/lib';
import type { RootStackParamList } from '@/types';

const log = createLogger('Journey');

import {
  DestinationInput,
  UnlockDatePicker,
  CollaboratorSection,
} from './components';

const DESTINATION_PLACEHOLDERS = [
  'Paris',
  'Tokyo',
  'New York',
  'Bali',
  'Iceland',
  'Barcelona',
  'Sydney',
  'London',
  'Costa Rica',
  'Greece',
  'Morocco',
  'Hawaii',
];

const getDefaultUnlockDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

type RouteProps = RouteProp<RootStackParamList, 'Journey'>;

export function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Determine mode
  const existingJourney = route.params?.journey;
  const isEditMode = !!existingJourney;

  // Form state
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
  const [unlockDate, setUnlockDate] = useState(getDefaultUnlockDate);
  const [loading, setLoading] = useState(false);

  // Cover image state
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImageAttribution, setCoverImageAttribution] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Collaborator state - userId is null for pending invites (new users)
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaborators, setCollaborators] = useState<{ email: string; userId: string | null; isPending: boolean }[]>([]);

  // Random placeholder for create mode
  const placeholder = useMemo(
    () => DESTINATION_PLACEHOLDERS[Math.floor(Math.random() * DESTINATION_PLACEHOLDERS.length)],
    []
  );

  // Initialize from existing journey
  useEffect(() => {
    if (existingJourney) {
      setName(existingJourney.name);
      setEmoji(existingJourney.emoji || null);
      setUnlockDate(new Date(existingJourney.unlock_date));
      setCoverImageUrl(existingJourney.cover_image_url || null);
      setCoverImageAttribution(existingJourney.cover_image_attribution || null);
    }
  }, [existingJourney]);

  // Fetch cover image when name changes (debounced) - only for new names
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    const trimmedName = name.trim();
    // Skip if editing and name hasn't changed
    if (isEditMode && trimmedName === existingJourney?.name) {
      return;
    }

    if (trimmedName.length >= 2) {
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          const photo = await searchLocationPhoto(trimmedName);
          if (photo) {
            setCoverImageUrl(photo.url);
            setCoverImageAttribution(photo.photographerName);
          }
        } catch {
          // Ignore errors
        }
      }, 800);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [name, isEditMode, existingJourney?.name]);

  const handleRemoveCollaborator = useCallback(
    (email: string) => {
      hapticClick();
      setCollaborators(collaborators.filter((c) => c.email !== email));
    },
    [collaborators]
  );

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      showToast('Please enter a destination', 'error');
      return;
    }

    if (!user?.id) {
      showToast('Not authenticated', 'error');
      return;
    }

    setLoading(true);

    try {
      // Process collaborator email if entered
      const allCollaboratorValues: string[] = collaborators.map((c) => c.userId || c.email);
      
      const pendingEmail = collaboratorEmail.trim().toLowerCase();
      if (pendingEmail && pendingEmail.includes('@') && pendingEmail.includes('.')) {
        // Check not already added
        const alreadyAdded = collaborators.some((c) => c.email === pendingEmail);
        const alreadyShared = existingJourney?.shared_with?.includes(pendingEmail);
        
        if (!alreadyAdded && !alreadyShared && pendingEmail !== user.email) {
          // Invite the collaborator
          const { data } = await inviteCollaborator(
            pendingEmail,
            name.trim() || 'a journey',
            user.email
          );
          
          if (data) {
            // Add to shared_with (userId if exists, email if pending)
            allCollaboratorValues.push(data.userId || data.email);
          }
        }
      }

      // Fetch cover image if name changed or creating new
      let finalCoverImageUrl = coverImageUrl;
      let finalCoverImageAttribution = coverImageAttribution;

      const nameChanged = !isEditMode || name.trim() !== existingJourney?.name;
      if (nameChanged && !finalCoverImageUrl) {
        const photo = await searchLocationPhoto(name.trim());
        if (photo) {
          finalCoverImageUrl = photo.url;
          finalCoverImageAttribution = photo.photographerName;
        }
      }

      if (isEditMode && existingJourney) {
        // Update existing journey
        const existingCollaboratorIds = existingJourney.shared_with || [];
        const mergedCollaborators = [...existingCollaboratorIds, ...allCollaboratorValues];

        const { error } = await updateJourney({
          id: existingJourney.id,
          name: name.trim(),
          unlockDate: unlockDate.toISOString(),
          emoji,
          coverImageUrl: finalCoverImageUrl,
          coverImageAttribution: finalCoverImageAttribution,
          sharedWith: mergedCollaborators.length > 0 ? mergedCollaborators : undefined,
        });

        if (error) {
          throw new Error(error);
        }

        invalidateJourneyCache(user.id);
        hapticSuccess();
        navigation.goBack();
      } else {
        // Create new journey
        const { data: journey, error } = await createJourney({
          userId: user.id,
          name: name.trim(),
          unlockDate: unlockDate.toISOString(),
          emoji: emoji || undefined,
          coverImageUrl: finalCoverImageUrl || undefined,
          coverImageAttribution: finalCoverImageAttribution || undefined,
          sharedWith: allCollaboratorValues.length > 0 ? allCollaboratorValues : undefined,
        });

        if (error) {
          throw new Error(error);
        }

        // Schedule notification for journey unlock
        if (journey?.id) {
          await scheduleJourneyUnlockNotification(journey.id, name.trim(), unlockDate);
        }

        invalidateJourneyCache(user.id);
        hapticSuccess();
        navigation.goBack();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(isEditMode ? 'Update journey failed' : 'Create journey failed', { error: message });
      hapticError();
      showToast(isEditMode ? 'Failed to update journey' : 'Failed to create journey', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    name,
    user?.id,
    user?.email,
    unlockDate,
    emoji,
    coverImageUrl,
    coverImageAttribution,
    collaborators,
    collaboratorEmail,
    isEditMode,
    existingJourney,
    showToast,
    navigation,
  ]);

  const isLocked = existingJourney ? new Date(existingJourney.unlock_date) > new Date() : true;

  return (
    <View style={styles.container}>
      <Background 
        imageUrl={coverImageUrl || undefined}
        unsplashQuery={!coverImageUrl ? 'warm sunset mountain landscape' : undefined} 
      />
      <Header paddingTop={insets.top} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          {/* Hero */}
          <Hero
            icon={isEditMode 
              ? <Pencil size={32} color={colors.white} />
              : <Compass size={32} color={colors.white} />
            }
            title={isEditMode ? 'Edit Journey' : 'New Journey'}
            subtitle={isEditMode ? 'Update your adventure details' : 'Where will your next adventure take you?'}
          />

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Destination/Name */}
            <DestinationInput
              value={name}
              onChangeText={setName}
              placeholder={placeholder}
            />

            {/* Emoji */}
            <EmojiSelector value={emoji} onChange={setEmoji} />

            {/* Date - only if journey is still locked */}
            {isLocked && (
              <UnlockDatePicker value={unlockDate} onChange={setUnlockDate} />
            )}

            {/* Collaborators */}
            <CollaboratorSection
              email={collaboratorEmail}
              onEmailChange={setCollaboratorEmail}
              collaborators={collaborators}
              onRemoveCollaborator={handleRemoveCollaborator}
            />
          </View>

          {/* Submit button */}
          <Button
            title={isEditMode ? 'Save Changes' : 'Create Journey'}
            onPress={handleSubmit}
            variant="accent"
            size="lg"
            loading={loading}
            disabled={!name.trim()}
            fullWidth
            icon={isEditMode 
              ? <Check size={20} color={colors.grayDark} />
              : <Plus size={20} color={colors.grayDark} />
            }
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientEnd,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
