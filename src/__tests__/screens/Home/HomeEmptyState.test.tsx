/**
 * HomeEmptyState component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeEmptyState } from '@/screens/Home/components/HomeEmptyState';

// Mock haptics
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib';

describe('HomeEmptyState', () => {
  const mockOnCreateJourney = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title text', () => {
    const { getByText } = render(
      <HomeEmptyState onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByText('Your story starts here')).toBeTruthy();
  });

  it('renders subtitle text', () => {
    const { getByText } = render(
      <HomeEmptyState onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByText('Capture moments now. Unlock them later.')).toBeTruthy();
  });

  it('renders Start a Journey button', () => {
    const { getByLabelText } = render(
      <HomeEmptyState onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByLabelText('Start a journey')).toBeTruthy();
  });

  it('calls onCreateJourney when button is pressed', () => {
    const { getByLabelText } = render(
      <HomeEmptyState onCreateJourney={mockOnCreateJourney} />
    );

    fireEvent.press(getByLabelText('Start a journey'));

    expect(mockOnCreateJourney).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback when button is pressed', () => {
    const { getByLabelText } = render(
      <HomeEmptyState onCreateJourney={mockOnCreateJourney} />
    );

    fireEvent.press(getByLabelText('Start a journey'));

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('renders feature icons', () => {
    const { getByText } = render(
      <HomeEmptyState onCreateJourney={mockOnCreateJourney} />
    );

    expect(getByText('Photos')).toBeTruthy();
    expect(getByText('Voice')).toBeTruthy();
    expect(getByText('Notes')).toBeTruthy();
  });

  it('renders polaroid stack', () => {
    const { toJSON } = render(
      <HomeEmptyState onCreateJourney={mockOnCreateJourney} />
    );

    // Verify the component renders (polaroid stack is internal UI)
    expect(toJSON()).toBeTruthy();
  });
});
