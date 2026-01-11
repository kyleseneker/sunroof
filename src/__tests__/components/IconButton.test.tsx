/**
 * IconButton component tests
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '@/components/ui';

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib/haptics';

describe('IconButton', () => {
  const TestIcon = () => <Text testID="icon">🔔</Text>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders icon', () => {
    const { getByTestId } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Notifications"
      />
    );

    expect(getByTestId('icon')).toBeTruthy();
  });

  it('calls onPress and hapticClick when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={onPress}
        accessibilityLabel="Notifications"
      />
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={onPress}
        accessibilityLabel="Notifications"
        disabled
      />
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with ghost variant (default)', () => {
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Notifications"
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('renders with filled variant', () => {
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Notifications"
        variant="filled"
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('renders with bordered variant', () => {
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Notifications"
        variant="bordered"
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('renders with sm size', () => {
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Notifications"
        size="sm"
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('renders with lg size', () => {
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Notifications"
        size="lg"
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Toggle notifications"
      />
    );

    expect(getByLabelText('Toggle notifications')).toBeTruthy();
  });

  it('applies custom style', () => {
    const { getByRole } = render(
      <IconButton
        icon={<TestIcon />}
        onPress={() => {}}
        accessibilityLabel="Notifications"
        style={{ marginRight: 10 }}
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });
});
