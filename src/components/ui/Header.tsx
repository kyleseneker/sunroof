/**
 * Header Component
 * Reusable screen header with back button, optional title, and optional right actions
 * Supports selection mode for multi-select screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import { IconButton } from './IconButton';
import { hapticClick } from '@/lib';

interface HeaderProps {
  /** Title displayed in the center */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Custom left icon (defaults to ChevronLeft) */
  leftIcon?: React.ReactNode;
  /** Handler for left button press (defaults to navigation.goBack) */
  onLeftPress?: () => void;
  /** Accessibility label for left button */
  leftAccessibilityLabel?: string;
  /** Right side content (typically IconButton(s)) */
  rightContent?: React.ReactNode;
  /** Top padding (typically insets.top + spacing.sm) */
  paddingTop?: number;
  /** Whether header is absolutely positioned */
  absolute?: boolean;
  /** Whether selection mode is active */
  isSelecting?: boolean;
  /** Handler for canceling selection (X button) */
  onCancelSelection?: () => void;
  /** Right side content when in selection mode */
  selectionActions?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  leftAccessibilityLabel = 'Back',
  rightContent,
  paddingTop = 0,
  absolute = false,
  isSelecting = false,
  onCancelSelection,
  selectionActions,
}: HeaderProps) {
  const navigation = useNavigation();

  const handleLeftPress = () => {
    hapticClick();
    if (onLeftPress) {
      onLeftPress();
    } else {
      navigation.goBack();
    }
  };

  const handleCancelSelection = () => {
    hapticClick();
    onCancelSelection?.();
  };

  // Selection mode rendering
  if (isSelecting) {
    return (
      <View
        style={[
          styles.header,
          { paddingTop: paddingTop + spacing.sm },
          absolute && styles.absolute,
        ]}
      >
        <IconButton
          icon={<X size={24} color={colors.white} />}
          onPress={handleCancelSelection}
          accessibilityLabel="Cancel selection"
          variant="ghost"
        />

        <View style={styles.spacer} />

        {selectionActions && (
          <View style={styles.selectionActions}>{selectionActions}</View>
        )}
      </View>
    );
  }

  // Normal mode rendering
  return (
    <View
      style={[
        styles.header,
        { paddingTop: paddingTop + spacing.sm },
        absolute && styles.absolute,
      ]}
    >
      <IconButton
        icon={leftIcon || <ChevronLeft size={24} color={colors.white} />}
        onPress={handleLeftPress}
        accessibilityLabel={leftAccessibilityLabel}
        variant="ghost"
      />

      {(title || subtitle) ? (
        <View style={styles.center}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.spacer} />
      )}

      {rightContent ? (
        <View style={styles.rightContent}>{rightContent}</View>
      ) : (
        // Empty view to maintain spacing when no right content
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  spacer: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholder: {
    width: 40,
  },
});
