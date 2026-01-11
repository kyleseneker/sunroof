/**
 * Memory Card
 * Individual memory thumbnail in the gallery grid
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Play, Quote, CheckCircle2 } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { CachedImage } from '@/components/ui';
import { formatDuration, hapticClick } from '@/lib';
import type { Memory } from '@/types';

const { width } = Dimensions.get('window');
// Account for: screen padding (lg*2) + day card padding (sm*2) + day card border (2) + gap between cards (md)
const ITEM_SIZE = (width - spacing.lg * 2 - spacing.sm * 2 - 2 - spacing.md) / 2;

interface MemoryCardProps {
  memory: Memory;
  timeStr: string;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const MemoryCard = memo(function MemoryCard({
  memory,
  timeStr,
  isSelecting,
  isSelected,
  onPress,
  onLongPress,
}: MemoryCardProps) {
  const handlePress = () => {
    hapticClick();
    onPress();
  };

  const handleLongPress = () => {
    hapticClick();
    onLongPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[styles.memoryCard, isSelected && styles.memoryCardSelected]}
      activeOpacity={0.8}
      accessibilityLabel={`${memory.type} memory at ${timeStr}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Photo Memory */}
      {memory.type === 'photo' && memory.url && (
        <View style={styles.photoMemory}>
          <CachedImage uri={memory.url} style={styles.photoImage} resizeMode="cover" />
        </View>
      )}

      {/* Video Memory */}
      {memory.type === 'video' && memory.url && (
        <View style={styles.videoMemory}>
          <CachedImage uri={memory.url} style={styles.videoThumbnail} resizeMode="cover" />
          <View style={styles.videoOverlay}>
            <View style={styles.videoPlayIcon}>
              <Play size={24} color={colors.white} style={styles.playIconOffset} />
            </View>
            {memory.duration !== undefined && memory.duration !== null && (
              <Text style={styles.videoDuration}>{formatDuration(memory.duration)}</Text>
            )}
          </View>
        </View>
      )}

      {/* Audio Memory */}
      {memory.type === 'audio' && (
        <LinearGradient
          colors={['rgba(245,158,11,0.4)', 'rgba(234,88,12,0.4)']}
          style={styles.audioMemory}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.audioIcon}>
            <Play size={20} color={colors.white} style={styles.playIconOffset} />
          </LinearGradient>
          <Text style={styles.audioDuration}>
            {memory.duration ? formatDuration(memory.duration) : 'Audio'}
          </Text>
          <Text style={styles.audioTime}>{timeStr}</Text>
        </LinearGradient>
      )}

      {/* Note Memory */}
      {memory.type === 'text' && (
        <LinearGradient
          colors={['rgba(245,158,11,0.4)', 'rgba(234,88,12,0.4)']}
          style={styles.noteMemory}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.noteIcon}>
            <Quote size={20} color={colors.white} />
          </LinearGradient>
          <Text style={styles.notePreview} numberOfLines={2}>
            {memory.note && memory.note.length > 30
              ? `${memory.note.slice(0, 30)}...`
              : memory.note}
          </Text>
          <Text style={styles.noteTime}>{timeStr}</Text>
        </LinearGradient>
      )}

      {/* Selection indicator */}
      {isSelecting && (
        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
          {isSelected && <CheckCircle2 size={20} color={colors.white} />}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  memoryCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  memoryCardSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  selectionIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.overlay.dark,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  photoMemory: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  videoMemory: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.grayDark,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.overlay.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.white,
    backgroundColor: colors.overlay.dark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  audioMemory: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: borderRadius.xl,
  },
  audioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  audioDuration: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.9)',
  },
  audioTime: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.xs,
  },
  noteMemory: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: borderRadius.xl,
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  notePreview: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  noteTime: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.xs,
  },
  playIconOffset: {
    marginLeft: 2,
  },
});

