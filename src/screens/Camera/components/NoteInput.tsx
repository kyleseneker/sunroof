/**
 * Note Input
 * Text input with prompts for note capture mode
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { MAX_NOTE_LENGTH } from '@/constants';
import { getNotePrompts } from '@/lib';

interface NoteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}

export function NoteInput({ value, onChangeText, autoFocus = true }: NoteInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [prompts] = useState<readonly string[]>(getNotePrompts);
  const [promptsExpanded, setPromptsExpanded] = useState(true);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handlePromptPress = (prompt: string) => {
    onChangeText(prompt + '\n\n');
    inputRef.current?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.noteContainer}
        keyboardVerticalOffset={100}
      >
        {/* Collapsible prompts section */}
        {value.length === 0 && prompts.length > 0 && (
          <View style={styles.promptsContainer}>
            <TouchableOpacity
              style={styles.promptsHeader}
              onPress={() => setPromptsExpanded(!promptsExpanded)}
              activeOpacity={0.7}
              accessibilityLabel={promptsExpanded ? 'Collapse prompts' : 'Expand prompts'}
              accessibilityRole="button"
            >
              <Sparkles size={12} color={colors.primary} />
              <Text style={styles.promptsLabel}>Try a prompt</Text>
              {promptsExpanded ? (
                <ChevronUp size={14} color={colors.primary} />
              ) : (
                <ChevronDown size={14} color={colors.primary} />
              )}
            </TouchableOpacity>
            {promptsExpanded && (
              <View style={styles.prompts}>
                {prompts.slice(0, 3).map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handlePromptPress(prompt)}
                    style={styles.promptButton}
                    accessibilityLabel={`Use prompt: ${prompt}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <TextInput
          ref={inputRef}
          style={styles.noteInput}
          placeholder="What do you want to remember?"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={value}
          onChangeText={onChangeText}
          multiline
          autoFocus={autoFocus}
          maxLength={MAX_NOTE_LENGTH}
          accessibilityLabel="Note input"
          accessibilityHint={`Maximum ${MAX_NOTE_LENGTH} characters`}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  noteContainer: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: spacing.lg,
    paddingBottom: 180,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  noteInput: {
    flex: 1,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.normal,
    color: colors.white,
    textAlignVertical: 'top',
  },
  promptsContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  promptsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  promptsLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  prompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  promptButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.overlay.light,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  promptText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
});

