/**
 * Toast notification provider
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: colors.success, text: colors.success };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: colors.error, text: colors.error };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: colors.warning, text: colors.warning };
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', border: colors.info, text: colors.info };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: insets.top + spacing.xxl + spacing.lg }]} pointerEvents="none">
        {toasts.map(toast => {
          const toastColors = getToastColors(toast.type);
          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                {
                  backgroundColor: toastColors.bg,
                  borderColor: toastColors.border,
                },
              ]}
            >
              <Text style={[styles.text, { color: toastColors.text }]}>{toast.message}</Text>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginBottom: spacing.sm,
    maxWidth: width - spacing.lg * 2,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});

