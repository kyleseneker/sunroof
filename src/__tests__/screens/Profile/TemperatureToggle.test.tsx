/**
 * TemperatureToggle component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TemperatureToggle } from '@/screens/Profile/components/TemperatureToggle';

describe('TemperatureToggle', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders celsius option', () => {
    const { getByText } = render(
      <TemperatureToggle value="celsius" onChange={mockOnChange} />
    );

    expect(getByText('°C')).toBeTruthy();
  });

  it('renders fahrenheit option', () => {
    const { getByText } = render(
      <TemperatureToggle value="celsius" onChange={mockOnChange} />
    );

    expect(getByText('°F')).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    const { UNSAFE_root } = render(
      <TemperatureToggle value="celsius" onChange={mockOnChange} loading={true} />
    );

    const ActivityIndicator = require('react-native').ActivityIndicator;
    expect(UNSAFE_root.findByType(ActivityIndicator)).toBeTruthy();
  });

  it('calls onChange when switching from celsius to fahrenheit', () => {
    const { getByText } = render(
      <TemperatureToggle value="celsius" onChange={mockOnChange} />
    );

    fireEvent.press(getByText('°F'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when switching from fahrenheit to celsius', () => {
    const { getByText } = render(
      <TemperatureToggle value="fahrenheit" onChange={mockOnChange} />
    );

    fireEvent.press(getByText('°C'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when pressing already selected celsius', () => {
    const { getByText } = render(
      <TemperatureToggle value="celsius" onChange={mockOnChange} />
    );

    fireEvent.press(getByText('°C'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when pressing already selected fahrenheit', () => {
    const { getByText } = render(
      <TemperatureToggle value="fahrenheit" onChange={mockOnChange} />
    );

    fireEvent.press(getByText('°F'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      <TemperatureToggle value="celsius" onChange={mockOnChange} />
    );

    expect(toJSON()).toBeTruthy();
  });
});
