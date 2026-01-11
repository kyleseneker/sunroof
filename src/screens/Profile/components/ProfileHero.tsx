/**
 * Profile Hero
 * Avatar with user name and email
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Avatar } from '@/components/ui';

interface ProfileHeroProps {
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

export function ProfileHero({ displayName, email, avatarUrl }: ProfileHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.avatarContainer}>
        <Avatar src={avatarUrl} name={displayName} email={email} size="xl" />
        <View style={styles.avatarBorder} />
      </View>
      <Text style={styles.userName}>{displayName}</Text>
      {email && <Text style={styles.userEmail}>{email}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.xs,
  },
});

