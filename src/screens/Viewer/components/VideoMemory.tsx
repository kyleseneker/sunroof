/**
 * Video Memory Display
 * Full-screen video with play/pause controls
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { Play } from 'lucide-react-native';
import { colors } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoMemoryProps {
  url: string;
  isPlaying: boolean;
  videoRef?: React.RefObject<VideoRef | null>;
  onTogglePlay: () => void;
  onEnd: () => void;
}

export function VideoMemory({
  url,
  isPlaying,
  videoRef,
  onTogglePlay,
  onEnd,
}: VideoMemoryProps) {
  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={styles.video}
        resizeMode="cover"
        paused={!isPlaying}
        repeat
        controls={false}
        onEnd={onEnd}
        accessibilityLabel="Memory video"
      />
      <TouchableOpacity
        onPress={onTogglePlay}
        style={styles.videoPlayOverlay}
        activeOpacity={0.8}
        accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
        accessibilityRole="button"
      >
        {!isPlaying && (
          <LinearGradient
            colors={['rgba(249,115,22,0.9)', 'rgba(234,88,12,0.9)']}
            style={styles.videoPlayButton}
          >
            <Play size={36} color={colors.white} style={styles.playIcon} />
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: SCREEN_HEIGHT * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playIcon: {
    marginLeft: 4,
  },
});

