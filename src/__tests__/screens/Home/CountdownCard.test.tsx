/**
 * CountdownCard component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { CountdownCard } from '@/screens/Home/components/CountdownCard';

// Mock the lib function
jest.mock('@/lib', () => ({
  getTimeUntilUnlock: jest.fn((date) => '5 days'),
}));

import { getTimeUntilUnlock } from '@/lib';

describe('CountdownCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders countdown time', () => {
    const { getByText } = render(
      <CountdownCard unlockDate="2025-01-15T00:00:00Z" />
    );

    expect(getByText('5 days')).toBeTruthy();
  });

  it('renders until unlock label', () => {
    const { getByText } = render(
      <CountdownCard unlockDate="2025-01-15T00:00:00Z" />
    );

    expect(getByText('until unlock')).toBeTruthy();
  });

  it('calls getTimeUntilUnlock with unlock date', () => {
    render(<CountdownCard unlockDate="2025-01-15T00:00:00Z" />);

    expect(getTimeUntilUnlock).toHaveBeenCalledWith('2025-01-15T00:00:00Z');
  });

  it('displays different countdown values', () => {
    (getTimeUntilUnlock as jest.Mock).mockReturnValue('12 hours');

    const { getByText } = render(
      <CountdownCard unlockDate="2025-01-10T12:00:00Z" />
    );

    expect(getByText('12 hours')).toBeTruthy();
  });
});
