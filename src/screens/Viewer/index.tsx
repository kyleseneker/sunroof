/**
 * Memory Viewer Screen
 * Full-screen immersive memory viewing experience
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  FlatList,
  Share,
  Platform,
  ViewToken,
  PermissionsAndroid,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoRef } from 'react-native-video';
import { createSound } from 'react-native-nitro-sound';

type SoundInstance = Awaited<ReturnType<typeof createSound>>;
import Clipboard from '@react-native-clipboard/clipboard';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Share2, Download, Copy, Tag, Trash2, X, MoreVertical } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Background, Header, IconButton, Pagination } from '@/components/ui';
import { ActionSheet } from '@/components/features';
import { useToast } from '@/providers';
import { deleteMemory } from '@/services';
import {
  hapticClick,
  hapticSuccess,
  hapticError,
  getPreference,
  createLogger,
  type TemperatureUnit,
} from '@/lib';
import type { Memory, RootStackParamList } from '@/types';

const log = createLogger('Viewer');

import {
  PhotoMemory,
  usePinchZoom,
  VideoMemory,
  AudioMemory,
  NoteMemory,
  MemoryMetadata,
  TagDisplay,
  TagModal,
} from './components';

type ViewerRouteProp = RouteProp<RootStackParamList, 'Viewer'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ViewerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ViewerRouteProp>();
  const { memory: initialMemory, memories, journeyName, coverImageUrl } = route.params;
  const { showToast } = useToast();

  // State
  const initialIndex = memories.findIndex((m) => m.id === initialMemory.id);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('fahrenheit');
  const [memoryTags, setMemoryTags] = useState<Record<string, string[]>>({});

  // Refs
  const audioPlayerRef = useRef<SoundInstance | null>(null);
  const flatListRef = useRef<FlatList<Memory>>(null);
  const videoRef = useRef<VideoRef>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-50)).current;
  const bottomSlide = useRef(new Animated.Value(50)).current;

  // Pinch-to-zoom
  const { resetZoom } = usePinchZoom();

  // Current memory
  const currentMemory = memories[currentIndex];

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(bottomSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, headerSlide, bottomSlide]);

  // Reset zoom when switching memories
  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  // Load temperature preference
  useEffect(() => {
    getPreference('temperatureUnit').then(setTemperatureUnit);
  }, []);

  // Initialize audio player and cleanup
  useEffect(() => {
    audioPlayerRef.current = createSound();
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stopPlayer().catch(() => {});
        audioPlayerRef.current.removePlayBackListener();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Stop audio when switching memories
  useEffect(() => {
    audioPlayerRef.current?.stopPlayer().catch(() => {});
    setIsAudioPlaying(false);
    setIsVideoPlaying(false);
  }, [currentIndex]);

  // FlatList viewability
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Audio handlers
  const playAudio = useCallback(
    async (memory: Memory) => {
      if (!memory.url || !audioPlayerRef.current) return;

      try {
        await audioPlayerRef.current.stopPlayer();
        audioPlayerRef.current.removePlayBackListener();

        await audioPlayerRef.current.startPlayer(memory.url);
        setIsAudioPlaying(true);

        audioPlayerRef.current.addPlayBackListener((e) => {
          if (e.currentPosition >= e.duration) {
            setIsAudioPlaying(false);
            audioPlayerRef.current?.stopPlayer().catch(() => {});
          }
        });
      } catch (err) {
        log.error(' Audio error', { error: err });
        showToast('Failed to play audio', 'error');
      }
    },
    [showToast]
  );

  const pauseAudio = useCallback(async () => {
    if (!audioPlayerRef.current) return;
    try {
      await audioPlayerRef.current.pausePlayer();
      setIsAudioPlaying(false);
    } catch (err) {
      log.error(' Pause error', { error: err });
    }
  }, []);

  // Action handlers
  const handleClose = () => {
    hapticClick();
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!currentMemory) return;

    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await deleteMemory(currentMemory.id);
              if (error) throw new Error(error);

              hapticSuccess();
              showToast('Memory deleted', 'success');

              if (memories.length <= 1) {
                navigation.goBack();
              }
            } catch {
              hapticError();
              showToast('Failed to delete memory', 'error');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!currentMemory) return;

    try {
      if (currentMemory.type === 'photo' && currentMemory.url) {
        await Share.share({
          url: currentMemory.url,
          message: `A memory from ${journeyName}`,
        });
      } else if (currentMemory.type === 'text' && currentMemory.note) {
        await Share.share({
          message: currentMemory.note,
        });
      }
    } catch {
      // Share cancelled
    }
  };

  const handleCopyNote = () => {
    if (currentMemory?.note) {
      Clipboard.setString(currentMemory.note);
      hapticSuccess();
      showToast('Copied to clipboard', 'success');
    }
  };

  const handleDownload = async () => {
    if (currentMemory?.type === 'photo' && currentMemory.url) {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'Sunroof needs access to save photos to your gallery.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            showToast('Permission needed to save photos', 'error');
            return;
          }
        }

        const filename = `sunroof-${Date.now()}.jpg`;
        const fileUri = `${RNFS.DocumentDirectoryPath}/${filename}`;

        await RNFS.downloadFile({
          fromUrl: currentMemory.url,
          toFile: fileUri,
        }).promise;

        await CameraRoll.save(fileUri, { type: 'photo' });
        await RNFS.unlink(fileUri);

        hapticSuccess();
        showToast('Saved to Photos', 'success');
      } catch {
        hapticError();
        showToast('Failed to save photo', 'error');
      }
    }
  };

  const handleShowTags = () => {
    hapticClick();
    setShowActionSheet(false);
    setShowTagModal(true);
  };

  // Get current tags
  const getCurrentTags = (): string[] => {
    if (!currentMemory) return [];
    return memoryTags[currentMemory.id] ?? currentMemory.tags ?? [];
  };

  const handleTagsChange = (tags: string[]) => {
    if (currentMemory) {
      setMemoryTags((prev) => ({ ...prev, [currentMemory.id]: tags }));
    }
  };

  // Action sheet options
  const getActionSheetOptions = () => {
    const options: Array<{
      label: string;
      icon: React.ReactNode;
      onPress: () => void;
      variant?: 'default' | 'danger';
    }> = [
      {
        label: 'Share',
        icon: <Share2 size={20} color={colors.white} />,
        onPress: handleShare,
      },
    ];

    if (currentMemory?.type === 'photo') {
      options.push({
        label: 'Save to Photos',
        icon: <Download size={20} color={colors.white} />,
        onPress: handleDownload,
      });
    }

    if (currentMemory?.type === 'text') {
      options.push({
        label: 'Copy Text',
        icon: <Copy size={20} color={colors.white} />,
        onPress: handleCopyNote,
      });
    }

    options.push({
      label: 'Tags',
      icon: <Tag size={20} color={colors.white} />,
      onPress: handleShowTags,
    });

    options.push({
      label: 'Delete',
      icon: <Trash2 size={20} color={colors.error} />,
      onPress: handleDelete,
      variant: 'danger',
    });

    return options;
  };

  // Render memory item
  const renderMemoryItem = useCallback(
    ({ item, index }: { item: Memory; index: number }) => {
      const isCurrentItem = index === currentIndex;

      return (
        <View style={styles.memoryItem}>
          {/* Photo */}
          {item.type === 'photo' && item.url && <PhotoMemory url={item.url} />}

          {/* Video */}
          {item.type === 'video' && item.url && (
            <VideoMemory
              url={item.url}
              isPlaying={isCurrentItem && isVideoPlaying}
              videoRef={isCurrentItem ? videoRef : undefined}
              onTogglePlay={() => {
                if (isCurrentItem) {
                  setIsVideoPlaying(!isVideoPlaying);
                }
              }}
              onEnd={() => {
                if (isCurrentItem) {
                  setIsVideoPlaying(false);
                }
              }}
            />
          )}

          {/* Audio */}
          {item.type === 'audio' && (
            <AudioMemory
              duration={item.duration ?? undefined}
              isPlaying={isCurrentItem && isAudioPlaying}
              onTogglePlay={() => {
                if (isCurrentItem) {
                  isAudioPlaying ? pauseAudio() : playAudio(item);
                }
              }}
            />
          )}

          {/* Note */}
          {item.type === 'text' && item.note && <NoteMemory note={item.note} />}
        </View>
      );
    },
    [currentIndex, isAudioPlaying, isVideoPlaying, playAudio, pauseAudio]
  );

  if (!currentMemory) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Background imageUrl={coverImageUrl} blurRadius={20} />

      {/* Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <Header
          paddingTop={insets.top + spacing.xs}
          leftIcon={<X size={24} color={colors.white} />}
          onLeftPress={handleClose}
          leftAccessibilityLabel="Close memory viewer"
          title={journeyName}
          subtitle={`${currentIndex + 1} of ${memories.length}`}
          rightContent={
            <IconButton
              icon={<MoreVertical size={20} color={colors.white} />}
              onPress={() => {
                hapticClick();
                setShowActionSheet(true);
              }}
              accessibilityLabel="Memory options"
              variant="ghost"
            />
          }
        />
      </Animated.View>

      {/* Swipeable content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <FlatList
          ref={flatListRef}
          data={memories}
          renderItem={renderMemoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="start"
          bounces={false}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
        />
      </Animated.View>

      {/* Bottom bar */}
      <Animated.View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + spacing.md,
            opacity: fadeAnim,
            transform: [{ translateY: bottomSlide }],
          },
        ]}
      >
        <MemoryMetadata memory={currentMemory} temperatureUnit={temperatureUnit} />
        <TagDisplay
          memoryId={currentMemory.id}
          tags={getCurrentTags()}
          onTagsChange={handleTagsChange}
        />
        <Pagination count={memories.length} currentIndex={currentIndex} />
      </Animated.View>

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Memory Options"
        options={getActionSheetOptions()}
      />

      {/* Tag Modal */}
      <TagModal
        visible={showTagModal}
        memoryId={currentMemory.id}
        tags={getCurrentTags()}
        onClose={() => setShowTagModal(false)}
        onTagsChange={handleTagsChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientEnd,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    alignItems: 'center',
  },
  memoryItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  content: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
