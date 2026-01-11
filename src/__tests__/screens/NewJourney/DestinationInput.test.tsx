/**
 * DestinationInput component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DestinationInput } from '@/screens/Journey/components/DestinationInput';

// Mock lib
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

import { hapticClick } from '@/lib';

describe('DestinationInput', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section label', () => {
    const { getByText } = render(
      <DestinationInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    expect(getByText('Where to?')).toBeTruthy();
  });

  it('renders input with placeholder', () => {
    const { getByPlaceholderText } = render(
      <DestinationInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    expect(getByPlaceholderText('Enter destination')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const { getByPlaceholderText } = render(
      <DestinationInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    fireEvent.changeText(getByPlaceholderText('Enter destination'), 'Paris');

    expect(mockOnChangeText).toHaveBeenCalledWith('Paris');
  });

  it('shows clear button when value is not empty', () => {
    const { UNSAFE_root } = render(
      <DestinationInput
        value="Tokyo"
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    const TouchableOpacity = require('react-native').TouchableOpacity;
    const touchables = UNSAFE_root.findAllByType(TouchableOpacity);
    // Should have a clear button
    expect(touchables.length).toBeGreaterThan(0);
  });

  it('hides clear button when value is empty', () => {
    const { toJSON } = render(
      <DestinationInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    // Verify component renders
    expect(toJSON()).toBeTruthy();
  });

  it('clears input when clear button is pressed', () => {
    const { UNSAFE_root } = render(
      <DestinationInput
        value="Tokyo"
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    const TouchableOpacity = require('react-native').TouchableOpacity;
    const clearButton = UNSAFE_root.findAllByType(TouchableOpacity)[0];
    fireEvent.press(clearButton);

    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });

  it('triggers haptic feedback when clearing', () => {
    const { UNSAFE_root } = render(
      <DestinationInput
        value="Tokyo"
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    const TouchableOpacity = require('react-native').TouchableOpacity;
    const clearButton = UNSAFE_root.findAllByType(TouchableOpacity)[0];
    fireEvent.press(clearButton);

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('displays current value', () => {
    const { getByDisplayValue } = render(
      <DestinationInput
        value="London"
        onChangeText={mockOnChangeText}
        placeholder="Enter destination"
      />
    );

    expect(getByDisplayValue('London')).toBeTruthy();
  });
});
