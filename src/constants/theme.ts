/**
 * Theme constants for Sunroof
 */

export const colors = {
  // Brand colors - matches app icon
  primary: '#f97316', // Orange 500
  secondary: '#fb923c', // Orange 400
  
  // Background gradients - matches app icon
  gradientStart: '#451a03', // Dark amber
  gradientMid: '#431407', // Dark orange  
  gradientEnd: '#1e1b4b', // Dark indigo
  
  // Semantic colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray: '#6b7280',      // Muted text, secondary icons
  grayDark: '#111827',  // Dark backgrounds, text on light buttons
  
  // Overlay colors (ascending opacity)
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',      // inputs, dividers, subtle backgrounds
    medium: 'rgba(255, 255, 255, 0.3)',     // badges, avatars, hover states
    dark: 'rgba(0, 0, 0, 0.5)',             // glass cards, badges, overlays
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const shadows = {
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
} as const;
