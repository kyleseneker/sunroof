/**
 * Offline Indicator
 * Shows connection status and pending sync count
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { WifiOff, Upload, Cloud } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { useOffline } from '@/providers';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
}

export function OfflineIndicator({ position = 'top' }: OfflineIndicatorProps) {
  const insets = useSafeAreaInsets();
  const { isOnline, pendingCount, isSyncing, syncProgress, needsManualSync, triggerSync } = useOffline();
  
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Show/hide animation - only show when offline or need manual sync
  useEffect(() => {
    const shouldShow = !isOnline || needsManualSync;
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: shouldShow ? 0 : -100,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOnline, needsManualSync, slideAnim, opacityAnim]);

  // Pulse animation when syncing
  useEffect(() => {
    if (isSyncing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSyncing, pulseAnim]);

  // Determine what to show
  const getContent = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff size={14} color={colors.white} />,
        text: 'Offline',
        subtext: pendingCount > 0 ? `${pendingCount} waiting to sync` : 'Captures saved locally',
        color: colors.warning,
        canTap: false,
      };
    }

    // Only show indicator when user needs to manually sync (came back online from offline)
    if (needsManualSync && pendingCount > 0) {
      if (isSyncing && syncProgress) {
        return {
          icon: <Upload size={14} color={colors.white} />,
          text: 'Syncing...',
          subtext: `${syncProgress.current} of ${syncProgress.total}`,
          color: colors.primary,
          canTap: false,
        };
      }

      return {
        icon: <Cloud size={14} color={colors.white} />,
        text: 'Ready to sync',
        subtext: `${pendingCount} pending · Tap to sync`,
        color: colors.success,
        canTap: true,
      };
    }

    return null;
  };

  const content = getContent();
  if (!content) return null;

  const handleTap = () => {
    if (content.canTap) {
      triggerSync();
    }
  };

  const positionStyle = position === 'top'
    ? { top: insets.top + spacing.sm }
    : { bottom: insets.bottom + spacing.sm };

  const Wrapper = content.canTap ? TouchableOpacity : View;

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents={content.canTap ? 'auto' : 'none'}
    >
      <Wrapper onPress={content.canTap ? handleTap : undefined} activeOpacity={0.8}>
        <View style={[styles.pill, { borderColor: content.color }]}>
          <Animated.View style={[styles.iconContainer, { backgroundColor: content.color, opacity: pulseAnim }]}>
            {content.icon}
          </Animated.View>
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>{content.text}</Text>
            <Text style={styles.subText}>{content.subtext}</Text>
          </View>
        </View>
      </Wrapper>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginRight: spacing.xs,
  },
  mainText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  subText: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
});

