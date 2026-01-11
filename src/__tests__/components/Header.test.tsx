/**
 * Header component tests
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Header } from '@/components/ui';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  hapticClick: jest.fn(),
  hapticLight: jest.fn(),
}));

import { hapticClick } from '@/lib/haptics';

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders back button', () => {
    const { getByLabelText } = render(<Header />);

    expect(getByLabelText('Back')).toBeTruthy();
  });

  it('navigates back when back button pressed', () => {
    const { getByLabelText } = render(<Header />);

    fireEvent.press(getByLabelText('Back'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
    expect(hapticClick).toHaveBeenCalled();
  });

  it('calls custom onLeftPress instead of goBack', () => {
    const onLeftPress = jest.fn();
    const { getByLabelText } = render(<Header onLeftPress={onLeftPress} />);

    fireEvent.press(getByLabelText('Back'));

    expect(onLeftPress).toHaveBeenCalledTimes(1);
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('renders title', () => {
    const { getByText } = render(<Header title="My Screen" />);

    expect(getByText('My Screen')).toBeTruthy();
  });

  it('renders subtitle', () => {
    const { getByText } = render(
      <Header title="My Screen" subtitle="Additional info" />
    );

    expect(getByText('Additional info')).toBeTruthy();
  });

  it('renders right content', () => {
    const { getByText } = render(
      <Header rightContent={<Text>Action</Text>} />
    );

    expect(getByText('Action')).toBeTruthy();
  });

  it('renders custom left icon', () => {
    const { getByTestId } = render(
      <Header leftIcon={<Text testID="custom-icon">🏠</Text>} />
    );

    expect(getByTestId('custom-icon')).toBeTruthy();
  });

  it('uses custom accessibility label for back button', () => {
    const { getByLabelText } = render(
      <Header leftAccessibilityLabel="Go home" />
    );

    expect(getByLabelText('Go home')).toBeTruthy();
  });

  describe('selection mode', () => {
    it('renders cancel button in selection mode', () => {
      const { getByLabelText } = render(
        <Header isSelecting onCancelSelection={() => {}} />
      );

      expect(getByLabelText('Cancel selection')).toBeTruthy();
    });

    it('calls onCancelSelection when X pressed', () => {
      const onCancelSelection = jest.fn();
      const { getByLabelText } = render(
        <Header isSelecting onCancelSelection={onCancelSelection} />
      );

      fireEvent.press(getByLabelText('Cancel selection'));

      expect(onCancelSelection).toHaveBeenCalledTimes(1);
      expect(hapticClick).toHaveBeenCalled();
    });

    it('renders selection actions', () => {
      const { getByText } = render(
        <Header
          isSelecting
          onCancelSelection={() => {}}
          selectionActions={<Text>Delete</Text>}
        />
      );

      expect(getByText('Delete')).toBeTruthy();
    });

    it('does not show title in selection mode', () => {
      const { queryByText } = render(
        <Header
          title="My Screen"
          isSelecting
          onCancelSelection={() => {}}
        />
      );

      expect(queryByText('My Screen')).toBeNull();
    });
  });
});
