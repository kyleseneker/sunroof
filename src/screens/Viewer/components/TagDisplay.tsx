/**
 * Tag Display
 * Shows tags on a memory and provides tag management modal
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Tag, Plus } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Modal, Button, Input } from '@/components/ui';
import { hapticClick, hapticSuccess, hapticError } from '@/lib';
import { addTagToMemory, removeTagFromMemory } from '@/services';
import { useToast } from '@/providers';

interface TagDisplayProps {
  memoryId: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagDisplay({ memoryId: _memoryId, tags, onTagsChange: _onTagsChange }: TagDisplayProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <View style={styles.tagsRow}>
      {tags.map((tag) => (
        <View key={tag} style={styles.tagChip}>
          <Text style={styles.tagChipText}>#{tag}</Text>
        </View>
      ))}
    </View>
  );
}

interface TagModalProps {
  visible: boolean;
  memoryId: string;
  tags: string[];
  onClose: () => void;
  onTagsChange: (tags: string[]) => void;
}

export function TagModal({ visible, memoryId, tags, onClose, onTagsChange }: TagModalProps) {
  const { showToast } = useToast();
  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setAddingTag(true);
    try {
      const { data, error } = await addTagToMemory(memoryId, newTag.trim());
      if (error) throw new Error(error);

      onTagsChange(data || []);
      setNewTag('');
      hapticSuccess();
    } catch {
      hapticError();
      showToast('Failed to add tag', 'error');
    } finally {
      setAddingTag(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    hapticClick();
    try {
      const { data, error } = await removeTagFromMemory(memoryId, tag);
      if (error) throw new Error(error);

      onTagsChange(data || []);
      hapticSuccess();
    } catch {
      hapticError();
      showToast('Failed to remove tag', 'error');
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Tags" variant="gradient">
      <Text style={styles.tagModalSubtitle}>Organize your memories with custom tags.</Text>

      {/* Current Tags Section */}
      <View style={styles.tagModalSection}>
        <View style={styles.tagModalSectionHeader}>
          <Tag size={16} color={colors.primary} />
          <Text style={styles.tagModalSectionTitle}>Current Tags</Text>
        </View>
        <View style={styles.tagList}>
          {tags.length === 0 ? (
            <Text style={styles.noTagsText}>No tags yet. Add one below!</Text>
          ) : (
            tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagPill}
                onPress={() => handleRemoveTag(tag)}
                activeOpacity={0.7}
                accessibilityLabel={`Remove tag ${tag}`}
                accessibilityRole="button"
              >
                <Text style={styles.tagPillText}>#{tag}</Text>
                <X size={14} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Add Tag Section */}
      <View style={styles.tagModalSection}>
        <View style={styles.tagModalSectionHeader}>
          <Plus size={16} color={colors.primary} />
          <Text style={styles.tagModalSectionTitle}>Add New Tag</Text>
        </View>
        <View style={styles.addTagRow}>
          <View style={styles.tagInputWrapper}>
            <Input
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Enter tag name..."
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleAddTag}
            />
          </View>
          <TouchableOpacity
            style={[styles.addTagButton, (!newTag.trim() || addingTag) && styles.addTagButtonDisabled]}
            onPress={handleAddTag}
            disabled={!newTag.trim() || addingTag}
            activeOpacity={0.7}
            accessibilityLabel="Add tag"
            accessibilityRole="button"
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <Button title="Done" onPress={onClose} variant="primary" size="lg" />
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Inline tag display
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tagChip: {
    backgroundColor: 'rgba(249,115,22,0.3)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.5)',
  },
  tagChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },

  // Modal styles
  tagModalSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  tagModalSection: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  tagModalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tagModalSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: 32,
  },
  noTagsText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(249,115,22,0.3)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.5)',
  },
  tagPillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  addTagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  tagInputWrapper: {
    flex: 1,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: colors.overlay.medium,
  },
});

