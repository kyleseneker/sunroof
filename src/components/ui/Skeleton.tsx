/**
 * Skeleton loading placeholder component
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/constants/theme';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width of the skeleton */
  width?: number;
  /** Height of the skeleton */
  height?: number;
  /** Custom style */
  style?: ViewStyle;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: width ? width / 2 : borderRadius.full,
        };
      case 'rectangular':
        return {
          borderRadius: borderRadius.md,
        };
      case 'text':
      default:
        return {
          borderRadius: borderRadius.sm,
        };
    }
  };

  const resolvedWidth = width ?? (variant === 'text' ? 100 : 40);
  const resolvedHeight = height ?? (variant === 'text' ? 16 : resolvedWidth);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getVariantStyles(),
        {
          width: resolvedWidth,
          height: variant === 'circular' ? resolvedWidth : resolvedHeight,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.overlay.medium,
  },
});
