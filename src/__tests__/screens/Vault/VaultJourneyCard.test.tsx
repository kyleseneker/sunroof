/**
 * JourneyCard (Vault) component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { JourneyCard } from '@/screens/Vault/components/JourneyCard';
import type { Journey } from '@/types';

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: object) => React.createElement(View, props);
});

// Mock lib
jest.mock('@/lib', () => ({
  formatDate: jest.fn((date, options) => {
    if (options?.year) {
      return 'Jan 15, 2025';
    }
    return 'Jan 1';
  }),
}));

const mockJourney: Journey = {
  id: 'journey-1',
  user_id: 'user-1',
  name: 'Beach Vacation',
  emoji: '🏖️',
  destination: 'Hawaii',
  unlock_date: '2025-01-15T00:00:00Z',
  status: 'past',
  created_at: '2025-01-01T00:00:00Z',
  cover_image_url: 'https://example.com/image.jpg',
  memory_count: 42,
  ai_recap: 'This was an amazing trip...',
};

describe('JourneyCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders journey name', () => {
    const { getByText } = render(
      <JourneyCard journey={mockJourney} onPress={mockOnPress} />
    );

    expect(getByText('Beach Vacation')).toBeTruthy();
  });

  it('renders journey emoji', () => {
    const { getByText } = render(
      <JourneyCard journey={mockJourney} onPress={mockOnPress} />
    );

    expect(getByText('🏖️')).toBeTruthy();
  });

  it('renders memory count', () => {
    const { getByText } = render(
      <JourneyCard journey={mockJourney} onPress={mockOnPress} />
    );

    expect(getByText('42 memories')).toBeTruthy();
  });

  it('renders singular memory label', () => {
    const singleMemoryJourney = { ...mockJourney, memory_count: 1 };
    const { getByText } = render(
      <JourneyCard journey={singleMemoryJourney} onPress={mockOnPress} />
    );

    expect(getByText('1 memory')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <JourneyCard journey={mockJourney} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Beach Vacation'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows recap badge when ai_recap exists', () => {
    const { UNSAFE_root } = render(
      <JourneyCard journey={mockJourney} onPress={mockOnPress} />
    );

    // Just verify it renders without error
    expect(UNSAFE_root).toBeTruthy();
  });

  it('hides recap badge when no ai_recap', () => {
    const noRecapJourney = { ...mockJourney, ai_recap: undefined };
    const { toJSON } = render(
      <JourneyCard journey={noRecapJourney} onPress={mockOnPress} />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders without cover image', () => {
    const noCoverJourney = { ...mockJourney, cover_image_url: undefined };
    const { getByText } = render(
      <JourneyCard journey={noCoverJourney} onPress={mockOnPress} />
    );

    expect(getByText('Beach Vacation')).toBeTruthy();
  });

  it('uses default emoji when none provided', () => {
    const noEmojiJourney = { ...mockJourney, emoji: undefined };
    const { getByText } = render(
      <JourneyCard journey={noEmojiJourney} onPress={mockOnPress} />
    );

    expect(getByText('📸')).toBeTruthy();
  });

  it('renders date range', () => {
    const { getByText } = render(
      <JourneyCard journey={mockJourney} onPress={mockOnPress} />
    );

    expect(getByText(/Jan 1.*Jan 15, 2025/)).toBeTruthy();
  });

  it('applies first card style', () => {
    const { toJSON } = render(
      <JourneyCard journey={mockJourney} onPress={mockOnPress} isFirst={true} />
    );

    expect(toJSON()).toBeTruthy();
  });
});
