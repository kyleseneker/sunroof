/**
 * VaultPeek component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VaultPeek } from '@/screens/Home/components/VaultPeek';

// Mock haptics
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib';

describe('VaultPeek', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Memory Vault text', () => {
    const { getByText } = render(
      <VaultPeek totalMemoryCount={0} onPress={mockOnPress} />
    );

    expect(getByText('Memory Vault')).toBeTruthy();
  });

  it('shows badge with memory count when count > 0', () => {
    const { getByText } = render(
      <VaultPeek totalMemoryCount={42} onPress={mockOnPress} />
    );

    expect(getByText('42')).toBeTruthy();
  });

  it('hides badge when count is 0', () => {
    const { queryByText } = render(
      <VaultPeek totalMemoryCount={0} onPress={mockOnPress} />
    );

    // There should be no number badge
    expect(queryByText('0')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(
      <VaultPeek totalMemoryCount={10} onPress={mockOnPress} />
    );

    fireEvent.press(getByLabelText('Open memory vault'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback when pressed', () => {
    const { getByLabelText } = render(
      <VaultPeek totalMemoryCount={10} onPress={mockOnPress} />
    );

    fireEvent.press(getByLabelText('Open memory vault'));

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('has button accessibility role', () => {
    const { getByLabelText } = render(
      <VaultPeek totalMemoryCount={10} onPress={mockOnPress} />
    );

    const button = getByLabelText('Open memory vault');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('renders with large memory count', () => {
    const { getByText } = render(
      <VaultPeek totalMemoryCount={999} onPress={mockOnPress} />
    );

    expect(getByText('999')).toBeTruthy();
  });
});
