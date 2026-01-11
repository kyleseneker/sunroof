/**
 * EmojiSelector component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmojiSelector } from '@/components/ui/EmojiSelector';

jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

describe('EmojiSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default label', () => {
    const { getByText } = render(
      <EmojiSelector onChange={mockOnChange} />
    );

    expect(getByText('Choose an icon')).toBeTruthy();
    expect(getByText('(optional)')).toBeTruthy();
  });

  it('renders with custom label', () => {
    const { getByText } = render(
      <EmojiSelector onChange={mockOnChange} label="Select Icon" />
    );

    expect(getByText('Select Icon')).toBeTruthy();
  });

  it('renders emoji buttons', () => {
    const { getByText } = render(
      <EmojiSelector onChange={mockOnChange} />
    );

    expect(getByText('✈️')).toBeTruthy();
    expect(getByText('🏖️')).toBeTruthy();
    expect(getByText('🏔️')).toBeTruthy();
  });

  it('calls onChange when emoji is selected', () => {
    const { getByText } = render(
      <EmojiSelector onChange={mockOnChange} />
    );

    fireEvent.press(getByText('🏖️'));
    expect(mockOnChange).toHaveBeenCalledWith('🏖️');
  });

  it('calls onChange with null when selected emoji is pressed again', () => {
    const { getByText } = render(
      <EmojiSelector value="🏖️" onChange={mockOnChange} />
    );

    fireEvent.press(getByText('🏖️'));
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('shows selected state for current value', () => {
    const { getByLabelText } = render(
      <EmojiSelector value="🏖️" onChange={mockOnChange} />
    );

    const button = getByLabelText('Select 🏖️ emoji');
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it('shows unselected state for non-selected emojis', () => {
    const { getByLabelText } = render(
      <EmojiSelector value="🏖️" onChange={mockOnChange} />
    );

    const button = getByLabelText('Select ✈️ emoji');
    expect(button.props.accessibilityState.selected).toBe(false);
  });

  it('handles null value', () => {
    const { getByText } = render(
      <EmojiSelector value={null} onChange={mockOnChange} />
    );

    expect(getByText('✈️')).toBeTruthy();
    fireEvent.press(getByText('✈️'));
    expect(mockOnChange).toHaveBeenCalledWith('✈️');
  });

  it('handles undefined value', () => {
    const { getByText } = render(
      <EmojiSelector onChange={mockOnChange} />
    );

    fireEvent.press(getByText('🚗'));
    expect(mockOnChange).toHaveBeenCalledWith('🚗');
  });

  it('includes variety of emojis', () => {
    const { getByText } = render(
      <EmojiSelector onChange={mockOnChange} />
    );

    // Original set
    expect(getByText('🎒')).toBeTruthy();
    expect(getByText('📸')).toBeTruthy();
    // Extended set
    expect(getByText('🚂')).toBeTruthy();
    expect(getByText('🌊')).toBeTruthy();
  });
});
