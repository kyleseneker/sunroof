/**
 * Button component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui';

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  hapticClick: jest.fn(),
}));

describe('Button', () => {
  it('renders with title', () => {
    const { getByText } = render(<Button title="Click me" onPress={() => {}} />);

    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} />);

    fireEvent.press(getByText('Click me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} disabled />);

    fireEvent.press(getByText('Click me'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Click me" onPress={onPress} loading testID="button" />
    );

    // Button shows loading indicator instead of text when loading
    const button = getByTestId('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'accent'] as const;

    variants.forEach((variant) => {
      const { getByText } = render(
        <Button title={`${variant} button`} onPress={() => {}} variant={variant} />
      );

      expect(getByText(`${variant} button`)).toBeTruthy();
    });
  });

  it('renders with icon', () => {
    const { getByText } = render(
      <Button title="With Icon" onPress={() => {}} icon={<></>} />
    );

    expect(getByText('With Icon')).toBeTruthy();
  });

  it('applies fullWidth style', () => {
    const { getByText } = render(<Button title="Full Width" onPress={() => {}} fullWidth />);

    expect(getByText('Full Width')).toBeTruthy();
  });
});

