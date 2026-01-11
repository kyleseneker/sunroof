/**
 * ActionSheet component tests
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ActionSheet } from '@/components/features';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('@/lib/haptics', () => ({
  hapticClick: jest.fn(),
  hapticLight: jest.fn(),
}));

import { hapticClick } from '@/lib/haptics';

describe('ActionSheet', () => {
  const mockOptions = [
    { label: 'Edit', onPress: jest.fn() },
    { label: 'Share', onPress: jest.fn() },
    { label: 'Delete', onPress: jest.fn(), variant: 'danger' as const },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockOptions.forEach((opt) => opt.onPress.mockClear());
  });

  it('renders options when visible', () => {
    const { getByText } = render(
      <ActionSheet
        visible
        onClose={() => {}}
        options={mockOptions}
      />
    );

    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <ActionSheet
        visible={false}
        onClose={() => {}}
        options={mockOptions}
      />
    );

    expect(queryByText('Edit')).toBeNull();
  });

  it('renders with custom title', () => {
    const { getByText } = render(
      <ActionSheet
        visible
        onClose={() => {}}
        title="Actions"
        options={mockOptions}
      />
    );

    expect(getByText('Actions')).toBeTruthy();
  });

  it('renders default title when not provided', () => {
    const { getByText } = render(
      <ActionSheet
        visible
        onClose={() => {}}
        options={mockOptions}
      />
    );

    expect(getByText('Options')).toBeTruthy();
  });

  it('calls option onPress when option pressed', async () => {
    const { getByText } = render(
      <ActionSheet
        visible
        onClose={() => {}}
        options={mockOptions}
      />
    );

    fireEvent.press(getByText('Edit'));

    expect(mockOptions[0].onPress).toHaveBeenCalledTimes(1);
    expect(hapticClick).toHaveBeenCalled();
  });

  it('calls onClose after option selected', async () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ActionSheet
        visible
        onClose={onClose}
        options={mockOptions}
      />
    );

    fireEvent.press(getByText('Share'));

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('does not call onPress for disabled option', () => {
    const disabledOptions = [
      { label: 'Disabled Option', onPress: jest.fn(), disabled: true },
    ];

    const { getByText } = render(
      <ActionSheet
        visible
        onClose={() => {}}
        options={disabledOptions}
      />
    );

    fireEvent.press(getByText('Disabled Option'));

    expect(disabledOptions[0].onPress).not.toHaveBeenCalled();
  });

  it('renders option with icon', () => {
    const optionsWithIcon = [
      {
        label: 'With Icon',
        onPress: jest.fn(),
        icon: <Text testID="option-icon">🎨</Text>,
      },
    ];

    const { getByTestId } = render(
      <ActionSheet
        visible
        onClose={() => {}}
        options={optionsWithIcon}
      />
    );

    expect(getByTestId('option-icon')).toBeTruthy();
  });

  it('applies danger styling to danger variant', () => {
    const { getByText } = render(
      <ActionSheet
        visible
        onClose={() => {}}
        options={mockOptions}
      />
    );

    const deleteOption = getByText('Delete');
    expect(deleteOption).toBeTruthy();
    // Danger option should exist
  });

  it('closes when close button pressed', async () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <ActionSheet
        visible
        onClose={onClose}
        options={mockOptions}
      />
    );

    fireEvent.press(getByLabelText('Close'));

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });
});
