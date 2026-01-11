/**
 * Photo Memory Display
 * Full-screen photo with pinch-to-zoom and caching
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CachedImage } from '@/components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoMemoryProps {
  url: string;
}

export function PhotoMemory({ url }: PhotoMemoryProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = baseScale.current * event.scale;
      scale.setValue(newScale);
    })
    .onEnd((event) => {
      let newScale = baseScale.current * event.scale;
      newScale = Math.max(1, Math.min(4, newScale));
      baseScale.current = newScale;

      if (newScale <= 1) {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        baseScale.current = 1;
      } else {
        scale.setValue(newScale);
      }
    });

  return (
    <View style={styles.photoContainer}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.zoomContainer, { transform: [{ scale }] }]}>
          <CachedImage
            uri={url}
            style={styles.photo}
            resizeMode="cover"
            showLoader={true}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/**
 * Reset zoom hook for external control
 */
export function usePinchZoom() {
  const resetZoom = () => {
    // No-op now - zoom state is internal to PhotoMemory
  };

  return { resetZoom };
}

const styles = StyleSheet.create({
  photoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
