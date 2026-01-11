/**
 * NoActiveJourneys component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NoActiveJourneys } from '@/screens/Home/components/NoActiveJourneys';

// Mock haptics
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib';

describe('NoActiveJourneys', () => {
  const mockOnCreateJourney = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title text', () => {
    const { getByText } = render(
      <NoActiveJourneys onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByText('Ready for another adventure?')).toBeTruthy();
  });

  it('renders subtitle text', () => {
    const { getByText } = render(
      <NoActiveJourneys onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByText('Your past journeys await in the vault.')).toBeTruthy();
  });

  it('renders Start a Journey button', () => {
    const { getByLabelText } = render(
      <NoActiveJourneys onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByLabelText('Start a journey')).toBeTruthy();
  });

  it('calls onCreateJourney when button is pressed', () => {
    const { getByLabelText } = render(
      <NoActiveJourneys onCreateJourney={mockOnCreateJourney} />
    );

    fireEvent.press(getByLabelText('Start a journey'));

    expect(mockOnCreateJourney).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback when button is pressed', () => {
    const { getByLabelText } = render(
      <NoActiveJourneys onCreateJourney={mockOnCreateJourney} />
    );

    fireEvent.press(getByLabelText('Start a journey'));

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('renders button text', () => {
    const { getByText } = render(
      <NoActiveJourneys onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByText('Start a Journey')).toBeTruthy();
  });

  it('renders polaroid stack visual', () => {
    const { toJSON } = render(
      <NoActiveJourneys onCreateJourney={mockOnCreateJourney} />
    );

    // Verify the component renders
    expect(toJSON()).toBeTruthy();
  });
});
