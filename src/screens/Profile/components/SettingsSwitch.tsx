/**
 * Settings Switch
 * Loading-aware switch for settings
 */

import React from 'react';
import { Switch, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/theme';

interface SettingsSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SettingsSwitch({ value, onValueChange, loading, disabled }: SettingsSwitchProps) {
  if (loading) {
    return <ActivityIndicator size="small" color={colors.primary} />;
  }

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.primary }}
      thumbColor={colors.white}
    />
  );
}

