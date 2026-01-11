/**
 * Modal component
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { hapticClick } from '@/lib';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Container style overrides */
  style?: ViewStyle;
  /** Whether to display as full screen */
  fullScreen?: boolean;
  /** Visual variant */
  variant?: 'default' | 'gradient';
  /** Accessibility label for the modal */
  accessibilityLabel?: string;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  style,
  fullScreen,
  variant = 'default',
  accessibilityLabel,
}: ModalProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          overshootClamping: true,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = () => {
    hapticClick();
    // Animate out before closing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const modalLabel = accessibilityLabel ?? title ?? 'Modal';

  const closeButton = (
    <TouchableOpacity
      onPress={handleClose}
      style={styles.closeButton}
      accessibilityLabel="Close modal"
      accessibilityRole="button"
      accessibilityHint="Dismisses this modal"
    >
      <X size={24} color={colors.white} />
    </TouchableOpacity>
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      accessibilityViewIsModal
      accessibilityLabel={modalLabel}
    >
      {fullScreen ? (
        <View
          style={[
            styles.fullScreenContent,
            {
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.lg,
            },
            style,
          ]}
          accessible
          accessibilityRole="none"
        >
          {/* Header */}
          <View style={styles.header}>
            {title && (
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
            )}
            {closeButton}
          </View>

          {children}
        </View>
      ) : (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="box-none">
          <TouchableWithoutFeedback
            onPress={handleClose}
            accessibilityLabel="Close modal by tapping outside"
            accessibilityRole="button"
          >
            <View style={styles.dismissArea} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[styles.contentWrapper, { transform: [{ translateY: slideAnim }] }]}
          >
            {variant === 'gradient' ? (
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
                style={[
                  styles.content,
                  styles.contentGradient,
                  { paddingBottom: insets.bottom + spacing.lg },
                  style,
                ]}
                accessible
                accessibilityRole="none"
              >
                {/* Handle bar */}
                <View style={[styles.handleBar, styles.handleBarLight]} />

                {/* Header */}
                {title && (
                  <View style={styles.header}>
                    <Text style={styles.title} accessibilityRole="header">
                      {title}
                    </Text>
                    {closeButton}
                  </View>
                )}

                {children}
              </LinearGradient>
            ) : (
              <View
                style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }, style]}
                accessible
                accessibilityRole="none"
              >
                {/* Handle bar */}
                <View style={styles.handleBar} />

                {/* Header */}
                {title && (
                  <View style={styles.header}>
                    <Text style={styles.title} accessibilityRole="header">
                      {title}
                    </Text>
                    {closeButton}
                  </View>
                )}

                {children}
              </View>
            )}
          </Animated.View>
        </Animated.View>
      )}
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  dismissArea: {
    flex: 1,
  },
  contentWrapper: {
    maxHeight: '90%',
    width: '100%',
    marginBottom: 0,
  },
  content: {
    backgroundColor: colors.grayDark,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    width: '100%',
  },
  contentGradient: {
    backgroundColor: 'transparent',
  },
  fullScreenContent: {
    flex: 1,
    backgroundColor: colors.grayDark,
    paddingHorizontal: spacing.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  handleBarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
});
