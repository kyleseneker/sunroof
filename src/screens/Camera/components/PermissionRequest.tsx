/**
 * Camera Permission Request
 * Displays when camera permission is not granted
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Camera, X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { IconButton } from '@/components/ui';

interface PermissionRequestProps {
  insetTop: number;
  onClose: () => void;
  onRequestPermission: () => void;
}

export function PermissionRequest({
  insetTop,
  onClose,
  onRequestPermission,
}: PermissionRequestProps) {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={styles.container}
    >
      <View style={[styles.permissionContainer, { paddingTop: insetTop }]}>
        <IconButton
          icon={<X size={20} color={colors.white} />}
          onPress={onClose}
          accessibilityLabel="Close"
          variant="ghost"
          style={styles.closeButton}
        />

        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            <Camera size={40} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionText}>Allow camera access to capture memories</Text>
          <TouchableOpacity
            onPress={onRequestPermission}
            style={styles.permissionButton}
            accessibilityLabel="Enable camera permission"
            accessibilityRole="button"
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  permissionButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.grayDark,
  },
});

