/**
 * Responsive layout utilities for iPad support
 */

import { useWindowDimensions, Platform } from 'react-native';

export interface ResponsiveInfo {
  /** Screen width */
  width: number;
  /** Screen height */
  height: number;
  /** Whether this is a tablet-sized device */
  isTablet: boolean;
  /** Whether this is landscape orientation */
  isLandscape: boolean;
  /** Max content width for readability (centered on tablet) */
  maxContentWidth: number;
  /** Number of columns for grids */
  gridColumns: number;
  /** Horizontal padding for content */
  contentPadding: number;
}

const TABLET_BREAKPOINT = 768;
const MAX_CONTENT_WIDTH = 500;

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  
  const isTablet = Platform.OS === 'ios' && width >= TABLET_BREAKPOINT;
  const isLandscape = width > height;
  
  // Max content width - constrain on tablets for better readability
  const maxContentWidth = isTablet ? MAX_CONTENT_WIDTH : width;
  
  // Grid columns based on screen size
  let gridColumns = 2;
  if (isTablet) {
    gridColumns = isLandscape ? 4 : 3;
  }
  
  // Content padding
  const contentPadding = isTablet ? 32 : 16;
  
  return {
    width,
    height,
    isTablet,
    isLandscape,
    maxContentWidth,
    gridColumns,
    contentPadding,
  };
}
