/**
 * ErrorBoundary component tests
 */

import React from 'react';
import { Text, View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Mock logger
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Component that throws an error
const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Working</Text>;
};

// Suppress console.error for error boundary tests
const originalConsoleError = console.error;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Child content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('renders error UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('renders custom fallback when provided', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<Text>Custom fallback</Text>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(getByText('Custom fallback')).toBeTruthy();
  });

  it('resets error state when Try Again is pressed', () => {
    // Create a controlled component that can toggle throwing
    let shouldThrow = true;
    const ControlledComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <Text>Recovered</Text>;
    };

    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ControlledComponent />
      </ErrorBoundary>
    );

    // Initially shows error
    expect(getByText('Something went wrong')).toBeTruthy();

    // Stop throwing
    shouldThrow = false;

    // Press Try Again
    fireEvent.press(getByText('Try Again'));

    // Re-render to trigger recovery
    rerender(
      <ErrorBoundary>
        <ControlledComponent />
      </ErrorBoundary>
    );

    // Should show recovered content
    expect(getByText('Recovered')).toBeTruthy();
  });

  it('shows error emoji in fallback', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(getByText('😵')).toBeTruthy();
  });

  it('shows apologetic message in fallback', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(
      getByText(/We're sorry, but something unexpected happened/)
    ).toBeTruthy();
  });

  it('renders multiple children correctly', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <View>
          <Text>First child</Text>
          <Text>Second child</Text>
        </View>
      </ErrorBoundary>
    );

    expect(getByText('First child')).toBeTruthy();
    expect(getByText('Second child')).toBeTruthy();
  });

  it('catches errors from deeply nested components', () => {
    const DeepNested = () => (
      <View>
        <View>
          <View>
            <ThrowingComponent />
          </View>
        </View>
      </View>
    );

    const { getByText } = render(
      <ErrorBoundary>
        <DeepNested />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
