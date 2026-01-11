/**
 * JourneyTimeline component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { JourneyTimeline } from '@/screens/Home/components/JourneyTimeline';

describe('JourneyTimeline', () => {
  // Create dates relative to current time for predictable tests
  const now = Date.now();
  const oneDayAgo = new Date(now - 1000 * 60 * 60 * 24).toISOString();
  const threeDaysAgo = new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString();
  const fiveDaysFromNow = new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString();
  const tenDaysFromNow = new Date(now + 1000 * 60 * 60 * 24 * 10).toISOString();

  it('renders current day', () => {
    const { getByText } = render(
      <JourneyTimeline createdAt={oneDayAgo} unlockDate={tenDaysFromNow} />
    );

    // Should show "Day 2" since journey started 1 day ago
    expect(getByText('Day 2')).toBeTruthy();
  });

  it('renders journey length', () => {
    const { getByText } = render(
      <JourneyTimeline createdAt={threeDaysAgo} unlockDate={fiveDaysFromNow} />
    );

    // Should show total days
    expect(getByText(/day journey/)).toBeTruthy();
  });

  it('renders timeline dots', () => {
    const { toJSON } = render(
      <JourneyTimeline createdAt={oneDayAgo} unlockDate={fiveDaysFromNow} />
    );

    // Verify component renders
    expect(toJSON()).toBeTruthy();
  });

  it('shows day 1 when just started', () => {
    const justNow = new Date().toISOString();
    const { getByText } = render(
      <JourneyTimeline createdAt={justNow} unlockDate={tenDaysFromNow} />
    );

    expect(getByText('Day 1')).toBeTruthy();
  });

  it('handles same-day unlock', () => {
    const today = new Date().toISOString();
    const { getByText } = render(
      <JourneyTimeline createdAt={today} unlockDate={today} />
    );

    expect(getByText('Day 1')).toBeTruthy();
    expect(getByText('of 1 day journey')).toBeTruthy();
  });

  it('renders with scrollable timeline', () => {
    const { UNSAFE_root } = render(
      <JourneyTimeline createdAt={threeDaysAgo} unlockDate={tenDaysFromNow} />
    );

    // Find the ScrollView
    const scrollView = UNSAFE_root.findByType(require('react-native').ScrollView);
    expect(scrollView).toBeTruthy();
    expect(scrollView.props.horizontal).toBe(true);
  });
});
