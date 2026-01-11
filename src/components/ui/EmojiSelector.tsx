/**
 * Emoji Selector
 * Horizontal scrollable emoji picker
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutChangeEvent } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

const JOURNEY_EMOJIS = [
  '✈️', '🏖️', '🏔️', '🎒', '🚗', '🎡', '🏕️', '🌴', '🗺️', '🎭', '🎸', '📸',
  '🚂', '🚢', '🛶', '🏝️', '🌆', '⛷️', '🏄', '🚴', '🌸', '🌊', '☀️', '🌙',
];

const EMOJI_BUTTON_WIDTH = 52;
const EMOJI_GAP = spacing.sm;

interface EmojiSelectorProps {
  value?: string | null;
  onChange: (emoji: string | null) => void;
  label?: string;
}

export function EmojiSelector({ value, onChange, label = 'Choose an icon' }: EmojiSelectorProps) {
  const scrollRef = useRef<ScrollView>(null);
  const userHasInteractedRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Auto-scroll to center selected emoji when value is set by props (not user interaction)
  useEffect(() => {
    if (value && !userHasInteractedRef.current && scrollRef.current && containerWidth > 0) {
      const index = JOURNEY_EMOJIS.indexOf(value);
      if (index >= 0) {
        // Calculate offset to center the emoji
        const emojiPosition = index * (EMOJI_BUTTON_WIDTH + EMOJI_GAP);
        const centerOffset = emojiPosition - (containerWidth / 2) + (EMOJI_BUTTON_WIDTH / 2);
        const clampedOffset = Math.max(0, centerOffset);
        
        // Small delay to ensure ScrollView is laid out
        setTimeout(() => {
          scrollRef.current?.scrollTo({ x: clampedOffset, animated: false });
        }, 50);
      }
    }
  }, [value, containerWidth]);

  const handleSelect = (emoji: string) => {
    userHasInteractedRef.current = true;
    hapticClick();
    // Toggle off if already selected
    onChange(value === emoji ? null : emoji);
  };

  return (
    <View style={styles.section}>
      <View style={styles.labelRow}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <Text style={styles.optional}>(optional)</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onLayout={handleLayout}
      >
        {JOURNEY_EMOJIS.map((e) => (
          <TouchableOpacity
            key={e}
            onPress={() => handleSelect(e)}
            style={[styles.emojiButton, value === e && styles.emojiButtonSelected]}
            accessibilityLabel={`Select ${e} emoji`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === e }}
          >
            <Text style={styles.emojiText}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optional: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.3)',
  },
  scrollContent: {
    paddingVertical: spacing.xs,
    gap: EMOJI_GAP,
  },
  emojiButton: {
    width: EMOJI_BUTTON_WIDTH,
    height: EMOJI_BUTTON_WIDTH,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: colors.white,
    borderWidth: 2,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  emojiText: {
    fontSize: 26,
  },
});
