/**
 * ToastProvider tests
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { ToastProvider, useToast } from '@/providers/ToastProvider';

// Test component that uses the toast hook
function TestComponent() {
  const { showToast } = useToast();

  return (
    <>
      <TouchableOpacity testID="show-info" onPress={() => showToast('Info message')}>
        <Text>Show Info</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="show-success" onPress={() => showToast('Success!', 'success')}>
        <Text>Show Success</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="show-error" onPress={() => showToast('Error!', 'error')}>
        <Text>Show Error</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="show-warning" onPress={() => showToast('Warning!', 'warning')}>
        <Text>Show Warning</Text>
      </TouchableOpacity>
    </>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children', () => {
    const { getByText } = render(
      <ToastProvider>
        <Text>Child content</Text>
      </ToastProvider>
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('shows toast when showToast is called', () => {
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.press(getByTestId('show-info'));

    expect(getByText('Info message')).toBeTruthy();
  });

  it('shows success toast with correct type', () => {
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.press(getByTestId('show-success'));

    expect(getByText('Success!')).toBeTruthy();
  });

  it('shows error toast with correct type', () => {
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.press(getByTestId('show-error'));

    expect(getByText('Error!')).toBeTruthy();
  });

  it('shows warning toast with correct type', () => {
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.press(getByTestId('show-warning'));

    expect(getByText('Warning!')).toBeTruthy();
  });

  it('removes toast after duration', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.press(getByTestId('show-info'));
    expect(getByText('Info message')).toBeTruthy();

    // Fast forward past the toast duration (3000ms)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(queryByText('Info message')).toBeNull();
  });

  it('can show multiple toasts', () => {
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.press(getByTestId('show-info'));
    fireEvent.press(getByTestId('show-success'));

    expect(getByText('Info message')).toBeTruthy();
    expect(getByText('Success!')).toBeTruthy();
  });
});

describe('useToast', () => {
  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    function InvalidComponent() {
      useToast();
      return null;
    }

    expect(() => render(<InvalidComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    console.error = originalError;
  });
});
