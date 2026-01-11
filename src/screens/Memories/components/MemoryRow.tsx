/**
 * Memory Row
 * Individual memory item in the list
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Check,
  Trash2,
  MapPin,
  Tag,
} from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';

interface MemoryMeta {
  id: string;
  type: 'photo' | 'video' | 'text' | 'audio';
  created_at: string;
  location_name?: string | null;
  tags?: string[];
}

interface MemoryRowProps {
  memory: MemoryMeta;
  isSelected: boolean;
  isSelecting: boolean;
  onToggleSelect: (id: string) => void;
  onLongPress: () => void;
  onDelete: (memory: MemoryMeta) => void;
}

const getTypeIcon = (type: MemoryMeta['type'], size = 18) => {
  const iconColor = colors.primary;
  switch (type) {
    case 'photo':
      return <ImageIcon size={size} color={iconColor} />;
    case 'video':
      return <Video size={size} color={iconColor} />;
    case 'audio':
      return <Mic size={size} color={iconColor} />;
    case 'text':
      return <FileText size={size} color={iconColor} />;
  }
};

const getTypeLabel = (type: MemoryMeta['type']) => {
  switch (type) {
    case 'photo':
      return 'Photo';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'text':
      return 'Note';
  }
};

export function MemoryRow({
  memory,
  isSelected,
  isSelecting,
  onToggleSelect,
  onLongPress,
  onDelete,
}: MemoryRowProps) {
  const time = new Date(memory.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={[styles.memoryRow, isSelected && styles.memoryRowSelected]}
      onPress={() => (isSelecting ? onToggleSelect(memory.id) : null)}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Selection checkbox */}
      {isSelecting && (
        <TouchableOpacity
          style={[styles.checkbox, isSelected && styles.checkboxSelected]}
          onPress={() => onToggleSelect(memory.id)}
        >
          {isSelected && <Check size={14} color={colors.white} />}
        </TouchableOpacity>
      )}

      {/* Type icon */}
      <View style={styles.typeIcon}>{getTypeIcon(memory.type)}</View>

      {/* Content */}
      <View style={styles.memoryContent}>
        <View style={styles.memoryHeader}>
          <Text style={styles.memoryType}>{getTypeLabel(memory.type)}</Text>
          <Text style={styles.memoryTime}>{time}</Text>
        </View>
        {(memory.location_name || (memory.tags && memory.tags.length > 0)) && (
          <View style={styles.memoryMeta}>
            {memory.location_name && (
              <View style={styles.metaItem}>
                <MapPin size={10} color="rgba(255,255,255,0.4)" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {memory.location_name}
                </Text>
              </View>
            )}
            {memory.tags && memory.tags.length > 0 && (
              <View style={styles.metaItem}>
                <Tag size={10} color="rgba(255,255,255,0.4)" />
                <Text style={styles.metaText}>{memory.tags.length}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Delete button (when not selecting) */}
      {!isSelecting && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(memory)}>
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  memoryRowSelected: {
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderColor: 'rgba(249,115,22,0.3)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(249,115,22,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memoryType: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  memoryTime: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.4)',
  },
  memoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    maxWidth: 120,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});

export type { MemoryMeta };

