/**
 * Action Sheet component - iOS style bottom sheet
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronRight } from 'lucide-react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { hapticClick } from '@/lib';
import { IconButton } from '@/components/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActionSheetOption {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export function ActionSheet({ visible, onClose, title, options }: ActionSheetProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleOptionPress = (option: ActionSheetOption) => {
    if (option.disabled) return;
    hapticClick();
    option.onPress();
    handleClose();
  };

  const handleClose = () => {
    hapticClick();
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheetWrapper,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
                style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
              >
                {/* Handle */}
                <View style={styles.handleContainer}>
                  <View style={styles.handle} />
                </View>

                {/* Header with title and X button */}
                <View style={styles.header}>
                  <Text style={styles.title}>{title || 'Options'}</Text>
                  <IconButton
                    icon={<X size={24} color={colors.white} />}
                    onPress={handleClose}
                    accessibilityLabel="Close"
                    variant="ghost"
                  />
                </View>

                {/* Options */}
                <ScrollView style={styles.optionsScroll} bounces={false}>
                  <View style={styles.optionsCard}>
                    {options.map((option, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <View style={styles.divider} />}
                        <TouchableOpacity
                          onPress={() => handleOptionPress(option)}
                          disabled={option.disabled}
                          activeOpacity={0.6}
                          style={[
                            styles.option,
                            option.disabled && styles.optionDisabled,
                          ]}
                        >
                          {option.icon && (
                            <View
                              style={[
                                styles.optionIcon,
                                option.variant === 'danger' && styles.optionIconDanger,
                              ]}
                            >
                              {option.icon}
                            </View>
                          )}
                          <View style={styles.optionContent}>
                            <Text
                              style={[
                                styles.optionLabel,
                                option.variant === 'danger' && styles.optionLabelDanger,
                              ]}
                            >
                              {option.label}
                            </Text>
                            {option.description && (
                              <Text style={styles.optionDescription}>
                                {option.description}
                              </Text>
                            )}
                          </View>
                          <ChevronRight
                            size={20}
                            color={option.variant === 'danger' ? colors.error : colors.gray}
                          />
                        </TouchableOpacity>
                      </React.Fragment>
                    ))}
                  </View>
                </ScrollView>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Icon size + padding + gap = offset for divider alignment
const DIVIDER_OFFSET = 44 + spacing.md + spacing.md;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  sheetWrapper: {
    maxHeight: '80%',
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl + spacing.xs,
    borderTopRightRadius: borderRadius.xl + spacing.xs,
    overflow: 'hidden',
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: spacing.xl + spacing.md,
    height: spacing.xs + 1,
    backgroundColor: colors.overlay.medium,
    borderRadius: borderRadius.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  optionsScroll: {
    paddingHorizontal: spacing.md,
  },
  optionsCard: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.overlay.light,
  },
  divider: {
    height: 1,
    backgroundColor: colors.overlay.light,
    marginLeft: DIVIDER_OFFSET,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconDanger: {
    backgroundColor: colors.overlay.light,
  },
  optionContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  optionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  optionLabelDanger: {
    color: colors.error,
  },
  optionDescription: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
});
