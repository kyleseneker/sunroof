/**
 * Photo Preview
 * Shows captured photo with save/discard options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { X, Camera, Send, Tag, Plus } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { IconButton, Modal, Button, Input } from '@/components/ui';
import { hapticClick } from '@/lib';

interface PhotoPreviewProps {
  uri: string;
  insets: { top: number; bottom: number };
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function PhotoPreview({
  uri,
  insets,
  tags,
  onTagsChange,
  onSave,
  onDiscard,
}: PhotoPreviewProps) {
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');

  const handleAddTag = () => {
    const trimmed = tagInputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      hapticClick();
      onTagsChange([...tags, trimmed]);
      setTagInputValue('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    hapticClick();
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Preview image - full screen */}
      <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <IconButton
            icon={<X size={20} color={colors.white} />}
            onPress={onDiscard}
            accessibilityLabel="Discard photo"
            variant="ghost"
          />
          <Text style={styles.headerTitle}>Preview</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + spacing.lg }]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.controlsContent}>
          {/* Feature cards row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureCardsRow}
            style={styles.featureCardsScroll}
          >
            {/* Tags feature card */}
            <TouchableOpacity
              style={[styles.featureCard, tags.length > 0 && styles.featureCardActive]}
              onPress={() => {
                hapticClick();
                setShowTagModal(true);
              }}
              activeOpacity={0.8}
              accessibilityLabel="Add tags"
              accessibilityRole="button"
            >
              <View style={styles.featureCardIconThemed}>
                <Tag size={16} color={colors.white} />
              </View>
              <View style={styles.featureCardContent}>
                <Text style={styles.featureCardLabel}>Tags</Text>
                <Text
                  style={[styles.featureCardValue, tags.length > 0 && styles.featureCardValueActive]}
                  numberOfLines={1}
                >
                  {tags.length > 0
                    ? tags
                        .slice(0, 2)
                        .map((t) => `#${t}`)
                        .join(' ') + (tags.length > 2 ? ` +${tags.length - 2}` : '')
                    : 'Add tags'}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={onDiscard}
              activeOpacity={0.8}
              accessibilityLabel="Retake photo"
              accessibilityRole="button"
            >
              <Camera size={20} color={colors.white} />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              activeOpacity={0.8}
              accessibilityLabel="Save photo"
              accessibilityRole="button"
            >
              <Text style={styles.saveText}>Save</Text>
              <Send size={18} color={colors.grayDark} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tag Modal */}
      <Modal
        visible={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setTagInputValue('');
        }}
        title="Add Tags"
        variant="gradient"
      >
        <Text style={styles.tagModalSubtitle}>Organize this memory with tags.</Text>

        {/* Current Tags */}
        {tags.length > 0 && (
          <View style={styles.tagModalSection}>
            <View style={styles.tagModalSectionHeader}>
              <Tag size={16} color={colors.primary} />
              <Text style={styles.tagModalSectionTitle}>Current Tags</Text>
            </View>
            <View style={styles.tagModalList}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tagModalPill}
                  onPress={() => handleRemoveTag(tag)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Remove tag ${tag}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.tagModalPillText}>#{tag}</Text>
                  <X size={14} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Add Tag */}
        <View style={styles.tagModalSection}>
          <View style={styles.tagModalSectionHeader}>
            <Plus size={16} color={colors.primary} />
            <Text style={styles.tagModalSectionTitle}>Add New Tag</Text>
          </View>
          <View style={styles.tagModalInputRow}>
            <View style={styles.inputWrapper}>
              <Input
                value={tagInputValue}
                onChangeText={setTagInputValue}
                placeholder="Enter tag name..."
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleAddTag}
              />
            </View>
            <TouchableOpacity
              style={[styles.tagModalAddButton, !tagInputValue.trim() && styles.tagModalAddButtonDisabled]}
              onPress={handleAddTag}
              disabled={!tagInputValue.trim()}
              accessibilityLabel="Add tag"
              accessibilityRole="button"
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Done"
          onPress={() => {
            setShowTagModal(false);
            setTagInputValue('');
          }}
          variant="primary"
          size="lg"
        />
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  featureCardsScroll: {
    marginBottom: spacing.lg,
  },
  featureCardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.overlay.dark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 120,
  },
  featureCardActive: {
    backgroundColor: 'rgba(249,115,22,0.1)',
    borderColor: 'rgba(249,115,22,0.3)',
  },
  featureCardIconThemed: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardContent: {
    flex: 1,
  },
  featureCardLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  featureCardValue: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: fontWeight.medium,
  },
  featureCardValueActive: {
    color: colors.primary,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.overlay.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retakeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  saveText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.grayDark,
  },
  // Tag modal styles
  tagModalSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  tagModalSection: {
    marginBottom: spacing.lg,
  },
  tagModalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tagModalSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagModalList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagModalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.4)',
  },
  tagModalPillText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  tagModalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tagModalAddButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagModalAddButtonDisabled: {
    backgroundColor: colors.overlay.light,
  },
  headerSpacer: {
    width: 40,
  },
  inputWrapper: {
    flex: 1,
  },
});

