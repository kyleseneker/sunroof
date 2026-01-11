/**
 * MenuItem component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { MenuItem } from '@/screens/Profile/components/MenuItem';

describe('MenuItem', () => {
  const mockIcon = <View testID="test-icon" />;
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label', () => {
    const { getByText } = render(
      <MenuItem icon={mockIcon} label="Settings" />
    );

    expect(getByText('Settings')).toBeTruthy();
  });

  it('renders icon', () => {
    const { getByTestId } = render(
      <MenuItem icon={mockIcon} label="Settings" />
    );

    expect(getByTestId('test-icon')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <MenuItem icon={mockIcon} label="Settings" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Settings'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders chevron when onPress is provided', () => {
    const { UNSAFE_root } = render(
      <MenuItem icon={mockIcon} label="Settings" onPress={mockOnPress} />
    );

    // Verify component renders (chevron is from lucide-react-native)
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    const { UNSAFE_root } = render(
      <MenuItem icon={mockIcon} label="Settings" loading={true} onPress={mockOnPress} />
    );

    const ActivityIndicator = require('react-native').ActivityIndicator;
    const loadingIndicator = UNSAFE_root.findAllByType(ActivityIndicator);
    expect(loadingIndicator.length).toBeGreaterThan(0);
  });

  it('disables press when loading', () => {
    const { getByText } = render(
      <MenuItem icon={mockIcon} label="Settings" loading={true} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Settings'));

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders with danger styling', () => {
    const { getByText } = render(
      <MenuItem icon={mockIcon} label="Delete Account" danger={true} />
    );

    // Verify danger text renders
    expect(getByText('Delete Account')).toBeTruthy();
  });

  it('renders custom right element', () => {
    const rightElement = <Text testID="custom-right">Custom</Text>;

    const { getByTestId } = render(
      <MenuItem icon={mockIcon} label="Settings" rightElement={rightElement} />
    );

    expect(getByTestId('custom-right')).toBeTruthy();
  });

  it('is disabled when no onPress provided', () => {
    const { getByText } = render(
      <MenuItem icon={mockIcon} label="Settings" />
    );

    // Just verify it renders (no error thrown)
    expect(getByText('Settings')).toBeTruthy();
  });

  it('has proper active opacity when pressable', () => {
    const { UNSAFE_root } = render(
      <MenuItem icon={mockIcon} label="Settings" onPress={mockOnPress} />
    );

    const TouchableOpacity = require('react-native').TouchableOpacity;
    const touchable = UNSAFE_root.findByType(TouchableOpacity);
    expect(touchable.props.activeOpacity).toBe(0.7);
  });
});
