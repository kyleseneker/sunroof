/**
 * Destination Input
 * Large input for journey destination
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { spacing, fontSize, fontWeight } from '@/constants/theme';
import { Input } from '@/components/ui';
import { hapticClick } from '@/lib';

interface DestinationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export function DestinationInput({ value, onChangeText, placeholder }: DestinationInputProps) {
  const handleClear = () => {
    hapticClick();
    onChangeText('');
  };

  return (
    <View style={styles.destinationSection}>
      <Text style={styles.sectionLabel}>Where to?</Text>
      <View style={styles.destinationInputWrapper}>
        <Input
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          containerStyle={styles.destinationInput}
          inputStyle={styles.destinationInputText}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  destinationSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  destinationInputWrapper: {
    position: 'relative',
  },
  destinationInput: {
    marginBottom: 0,
  },
  destinationInputText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: spacing.xs,
  },
});

