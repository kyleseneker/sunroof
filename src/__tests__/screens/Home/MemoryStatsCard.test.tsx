/**
 * MemoryStatsCard component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MemoryStatsCard } from '@/screens/Home/components/MemoryStatsCard';

// Mock haptics
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib';

describe('MemoryStatsCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders memory count', () => {
    const { getByText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={0}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('5')).toBeTruthy();
  });

  it('renders singular label for one memory', () => {
    const { getByText } = render(
      <MemoryStatsCard
        memoryCount={1}
        pendingCount={0}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('memory captured')).toBeTruthy();
  });

  it('renders plural label for multiple memories', () => {
    const { getByText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={0}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText(/memories captured/)).toBeTruthy();
  });

  it('shows pending count when not syncing', () => {
    const { getByText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={3}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText(/\+3 pending/)).toBeTruthy();
  });

  it('shows syncing status when syncing', () => {
    const { getByText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={2}
        isSyncing={true}
        onPress={mockOnPress}
      />
    );

    expect(getByText(/\+2 syncing/)).toBeTruthy();
  });

  it('hides pending when count is 0', () => {
    const { queryByText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={0}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    expect(queryByText(/pending/)).toBeNull();
    expect(queryByText(/syncing/)).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={0}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByLabelText('5 memories captured'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback when pressed', () => {
    const { getByLabelText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={0}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByLabelText('5 memories captured'));

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility hint', () => {
    const { getByLabelText } = render(
      <MemoryStatsCard
        memoryCount={5}
        pendingCount={0}
        isSyncing={false}
        onPress={mockOnPress}
      />
    );

    const card = getByLabelText('5 memories captured');
    expect(card.props.accessibilityHint).toBe('View all memories');
  });
});
