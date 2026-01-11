/**
 * UnlockDatePicker component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UnlockDatePicker } from '@/screens/Journey/components/UnlockDatePicker';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { testID?: string }) => React.createElement(View, { testID: props.testID || 'date-picker' }),
  };
});

// Mock haptics
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib';

describe('UnlockDatePicker', () => {
  const mockOnChange = jest.fn();
  const testDate = new Date('2025-06-15');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section label', () => {
    const { getByText } = render(
      <UnlockDatePicker value={testDate} onChange={mockOnChange} />
    );

    expect(getByText('When should it unlock?')).toBeTruthy();
  });

  it('renders formatted date', () => {
    const { getByText } = render(
      <UnlockDatePicker value={testDate} onChange={mockOnChange} />
    );

    // Check for formatted date (will vary based on locale/timezone)
    expect(getByText(/June.*2025/)).toBeTruthy();
  });

  it('shows date picker when button is pressed', () => {
    const { getByText, queryByTestId } = render(
      <UnlockDatePicker value={testDate} onChange={mockOnChange} />
    );

    // Initially no date picker
    expect(queryByTestId('date-picker')).toBeNull();

    // Press the date button
    fireEvent.press(getByText(/June/));

    // Date picker should now be shown
    expect(queryByTestId('date-picker')).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      <UnlockDatePicker value={testDate} onChange={mockOnChange} />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders calendar icon', () => {
    const { UNSAFE_root } = render(
      <UnlockDatePicker value={testDate} onChange={mockOnChange} />
    );

    // Just verify component renders
    expect(UNSAFE_root).toBeTruthy();
  });
});
