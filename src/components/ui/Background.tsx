/**
 * Background
 * Simple background component with image or gradient support
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '@/constants/theme';
import { searchLocationPhoto } from '@/lib';
import { CachedImage } from './CachedImage';

const OVERLAY_COLORS = ['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)'];
const DEFAULT_GRADIENT = [colors.gradientStart, colors.gradientMid, colors.gradientEnd];

interface BackgroundProps {
  /** Image URL to use as background */
  imageUrl?: string | null;
  /** Search query to fetch background from Unsplash (used if no imageUrl) */
  unsplashQuery?: string;
  /** Gradient colors when no image (defaults to theme gradient) */
  gradient?: string[];
  /** Blur radius for the background image */
  blurRadius?: number;
}

export function Background({ imageUrl, unsplashQuery, gradient, blurRadius = 0 }: BackgroundProps) {
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl && unsplashQuery) {
      searchLocationPhoto(unsplashQuery)
        .then((photo) => {
          if (photo) setFetchedImageUrl(photo.url);
        })
        .catch(() => {});
    }
  }, [imageUrl, unsplashQuery]);

  const backgroundImageUrl = imageUrl || fetchedImageUrl;
  const gradientColors = gradient || DEFAULT_GRADIENT;

  if (backgroundImageUrl) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <CachedImage
          uri={backgroundImageUrl}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          blurRadius={blurRadius}
        />
        <LinearGradient colors={OVERLAY_COLORS} style={StyleSheet.absoluteFillObject} />
      </View>
    );
  }

  return <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />;
}
