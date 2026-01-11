/**
 * Unlock Date Picker
 * Date selection with visual picker
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { hapticClick } from '@/lib';

const getDefaultUnlockDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

const isDefaultDate = (date: Date) => {
  const defaultDate = getDefaultUnlockDate();
  return date.toDateString() === defaultDate.toDateString();
};

interface UnlockDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function UnlockDatePicker({ value, onChange }: UnlockDatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleReset = () => {
    hapticClick();
    onChange(getDefaultUnlockDate());
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>When does your journey end?</Text>
      <View style={styles.dateButtonWrapper}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Calendar size={20} color={colors.primary} />
          <Text style={[styles.dateText, isDefaultDate(value) && styles.dateTextDefault]}>
            {value.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
        {!isDefaultDate(value) && (
          <TouchableOpacity
            onPress={handleReset}
            style={styles.dateClearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          minimumDate={getDefaultUnlockDate()}
          themeVariant="dark"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
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
  dateButtonWrapper: {
    position: 'relative',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.overlay.light,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.xxl,
  },
  dateClearButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: spacing.xs,
  },
  dateText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  dateTextDefault: {
    color: 'rgba(255,255,255,0.5)',
  },
});

