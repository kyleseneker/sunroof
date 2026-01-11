/**
 * Note Memory Display
 * Styled text note with quote decorations
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontWeight } from '@/constants/theme';

interface NoteMemoryProps {
  note: string;
}

export function NoteMemory({ note }: NoteMemoryProps) {
  return (
    <View style={styles.noteContainer}>
      <View style={styles.quoteDecoration}>
        <Text style={styles.quoteIcon}>&quot;</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.noteScroll}>
        <Text style={styles.noteText} accessibilityRole="text">
          {note}
        </Text>
      </ScrollView>

      <View style={[styles.quoteDecoration, styles.quoteDecorationEnd]}>
        <Text style={styles.quoteIcon}>&quot;</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noteContainer: {
    alignItems: 'center',
    maxWidth: 360,
    paddingHorizontal: spacing.lg,
  },
  quoteDecoration: {
    marginBottom: spacing.sm,
  },
  quoteDecorationEnd: {
    marginBottom: 0,
    marginTop: spacing.sm,
  },
  quoteIcon: {
    fontSize: 48,
    color: colors.primary,
    opacity: 0.4,
    fontWeight: fontWeight.light,
  },
  noteScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  noteText: {
    fontSize: 22,
    fontWeight: fontWeight.light,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 34,
    fontStyle: 'italic',
  },
});

