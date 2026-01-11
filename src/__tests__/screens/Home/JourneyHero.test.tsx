/**
 * JourneyHero component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { JourneyHero } from '@/screens/Home/components/JourneyHero';
import type { Journey } from '@/types';

const mockJourney: Journey = {
  id: 'journey-1',
  user_id: 'user-1',
  name: 'Beach Vacation',
  emoji: '🏖️',
  destination: 'Hawaii',
  unlock_date: '2025-01-15T00:00:00Z',
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
};

describe('JourneyHero', () => {
  it('renders journey name', () => {
    const { getByText } = render(
      <JourneyHero journey={mockJourney} isOwner={true} />
    );

    expect(getByText('Beach Vacation')).toBeTruthy();
  });

  it('renders journey emoji', () => {
    const { getByText } = render(
      <JourneyHero journey={mockJourney} isOwner={true} />
    );

    expect(getByText('🏖️')).toBeTruthy();
  });

  it('renders journey destination', () => {
    const { getByText } = render(
      <JourneyHero journey={mockJourney} isOwner={true} />
    );

    expect(getByText('Hawaii')).toBeTruthy();
  });

  it('shows shared badge when not owner', () => {
    const { getByText } = render(
      <JourneyHero journey={mockJourney} isOwner={false} />
    );

    expect(getByText('Shared with you')).toBeTruthy();
  });

  it('hides shared badge when owner', () => {
    const { queryByText } = render(
      <JourneyHero journey={mockJourney} isOwner={true} />
    );

    expect(queryByText('Shared with you')).toBeNull();
  });

  it('renders without emoji', () => {
    const journeyNoEmoji = { ...mockJourney, emoji: undefined };
    const { getByText } = render(
      <JourneyHero journey={journeyNoEmoji} isOwner={true} />
    );

    expect(getByText('Beach Vacation')).toBeTruthy();
  });

  it('renders without destination', () => {
    const journeyNoDestination = { ...mockJourney, destination: undefined };
    const { getByText } = render(
      <JourneyHero journey={journeyNoDestination} isOwner={true} />
    );

    expect(getByText('Beach Vacation')).toBeTruthy();
  });

  it('renders with null destination', () => {
    const journeyNullDestination = { ...mockJourney, destination: null };
    const { toJSON } = render(
      <JourneyHero journey={journeyNullDestination} isOwner={true} />
    );

    expect(toJSON()).toBeTruthy();
  });
});
