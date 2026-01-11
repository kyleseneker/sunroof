/**
 * LockedJourneyCard component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LockedJourneyCard } from '@/screens/Vault/components/LockedJourneyCard';
import type { Journey } from '@/types';

// Mock the lib function
jest.mock('@/lib', () => ({
  getTimeUntilUnlock: jest.fn(() => 'in 3 days'),
}));

const mockJourney: Journey = {
  id: 'journey-1',
  user_id: 'user-1',
  name: 'Beach Vacation',
  emoji: '🏖️',
  unlock_date: '2025-01-15T00:00:00Z',
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
};

describe('LockedJourneyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders journey name', () => {
    const { getByText } = render(
      <LockedJourneyCard journey={mockJourney} />
    );

    expect(getByText('Beach Vacation')).toBeTruthy();
  });

  it('renders journey emoji', () => {
    const { getByText } = render(
      <LockedJourneyCard journey={mockJourney} />
    );

    expect(getByText('🏖️')).toBeTruthy();
  });

  it('renders unlock time', () => {
    const { getByText } = render(
      <LockedJourneyCard journey={mockJourney} />
    );

    expect(getByText('Unlocks in 3 days')).toBeTruthy();
  });

  it('uses default lock emoji when no emoji provided', () => {
    const journeyNoEmoji = { ...mockJourney, emoji: undefined };
    const { getByText } = render(
      <LockedJourneyCard journey={journeyNoEmoji} />
    );

    expect(getByText('🔒')).toBeTruthy();
  });

  it('shows soon when no unlock date', () => {
    const journeyNoDate = { ...mockJourney, unlock_date: undefined };
    const { getByText } = render(
      <LockedJourneyCard journey={journeyNoDate} />
    );

    expect(getByText('Unlocks soon')).toBeTruthy();
  });
});
