/**
 * Home Screen Header
 * Contains avatar, logo, and action buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Plus, MoreVertical } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Avatar, IconButton } from '@/components/ui';
import { hapticClick } from '@/lib';

interface HomeHeaderProps {
  user: {
    user_metadata?: {
      avatar_url?: string;
      picture?: string;
      display_name?: string;
      full_name?: string;
    };
    email?: string;
  } | null;
  canCreateJourney: boolean;
  hasCurrentJourney: boolean;
  onProfilePress: () => void;
  onCreatePress: () => void;
  onOptionsPress: () => void;
}

export function HomeHeader({
  user,
  canCreateJourney,
  hasCurrentJourney,
  onProfilePress,
  onCreatePress,
  onOptionsPress,
}: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          onPress={() => {
            hapticClick();
            onProfilePress();
          }}
          accessibilityLabel="View profile"
          accessibilityRole="button"
        >
          <Avatar
            src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
            name={user?.user_metadata?.display_name || user?.user_metadata?.full_name}
            email={user?.email}
            size="md"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.headerCenter}>
        <View style={styles.logoRow}>
          <Image
            source={require('../../../../assets/icon-transparent.png')}
            style={styles.logoIcon}
            tintColor={colors.white}
          />
          <Text style={styles.logoText}>Sunroof</Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        {canCreateJourney && (
          <IconButton
            icon={<Plus size={20} color={colors.white} />}
            onPress={onCreatePress}
            accessibilityLabel="Create journey"
            variant="ghost"
          />
        )}
        {hasCurrentJourney && (
          <IconButton
            icon={<MoreVertical size={20} color={colors.white} />}
            onPress={onOptionsPress}
            accessibilityLabel="Journey options"
            variant="ghost"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoIcon: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

