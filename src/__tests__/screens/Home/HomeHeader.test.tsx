/**
 * HomeHeader component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeHeader } from '@/screens/Home/components/HomeHeader';

// Mock lib
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
  hapticLight: jest.fn(),
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

import { hapticClick } from '@/lib';

const mockUser = {
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
};

describe('HomeHeader', () => {
  const mockOnProfilePress = jest.fn();
  const mockOnCreatePress = jest.fn();
  const mockOnOptionsPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo text', () => {
    const { getByText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={true}
        hasCurrentJourney={true}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    expect(getByText('Sunroof')).toBeTruthy();
  });

  it('calls onProfilePress when avatar is pressed', () => {
    const { getByLabelText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={true}
        hasCurrentJourney={true}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    fireEvent.press(getByLabelText('View profile'));

    expect(mockOnProfilePress).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic when profile is pressed', () => {
    const { getByLabelText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={true}
        hasCurrentJourney={true}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    fireEvent.press(getByLabelText('View profile'));

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('shows create button when canCreateJourney is true', () => {
    const { getByLabelText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={true}
        hasCurrentJourney={false}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    expect(getByLabelText('Create journey')).toBeTruthy();
  });

  it('hides create button when canCreateJourney is false', () => {
    const { queryByLabelText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={false}
        hasCurrentJourney={false}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    expect(queryByLabelText('Create journey')).toBeNull();
  });

  it('shows options button when hasCurrentJourney is true', () => {
    const { getByLabelText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={false}
        hasCurrentJourney={true}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    expect(getByLabelText('Journey options')).toBeTruthy();
  });

  it('hides options button when hasCurrentJourney is false', () => {
    const { queryByLabelText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={true}
        hasCurrentJourney={false}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    expect(queryByLabelText('Journey options')).toBeNull();
  });

  it('calls onCreatePress when create button is pressed', () => {
    const { getByLabelText } = render(
      <HomeHeader
        user={mockUser}
        canCreateJourney={true}
        hasCurrentJourney={false}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    fireEvent.press(getByLabelText('Create journey'));

    expect(mockOnCreatePress).toHaveBeenCalledTimes(1);
  });

  it('handles null user', () => {
    const { getByText } = render(
      <HomeHeader
        user={null}
        canCreateJourney={true}
        hasCurrentJourney={false}
        onProfilePress={mockOnProfilePress}
        onCreatePress={mockOnCreatePress}
        onOptionsPress={mockOnOptionsPress}
      />
    );

    expect(getByText('Sunroof')).toBeTruthy();
  });
});
