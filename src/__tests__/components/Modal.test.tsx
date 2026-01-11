/**
 * Modal component tests
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Modal } from '@/components/ui';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('@/lib/haptics', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib/haptics';

describe('Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when visible', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}}>
        <Text>Modal Content</Text>
      </Modal>
    );

    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <Modal visible={false} onClose={() => {}}>
        <Text>Modal Content</Text>
      </Modal>
    );

    // Modal with visible=false should not show content
    // React Native Modal still renders but should be hidden
    expect(queryByText('Modal Content')).toBeNull();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}} title="Settings">
        <Text>Content</Text>
      </Modal>
    );

    expect(getByText('Settings')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', async () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <Modal visible onClose={onClose} title="Test Modal">
        <Text>Content</Text>
      </Modal>
    );

    const closeButton = getByLabelText('Close modal');
    fireEvent.press(closeButton);

    // Wait for animation to complete
    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });

  it('triggers haptic feedback when closing', () => {
    const { getByLabelText } = render(
      <Modal visible onClose={() => {}} title="Test Modal">
        <Text>Content</Text>
      </Modal>
    );

    fireEvent.press(getByLabelText('Close modal'));

    expect(hapticClick).toHaveBeenCalled();
  });

  it('renders full screen modal', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}} title="Full Screen" fullScreen>
        <Text>Full Screen Content</Text>
      </Modal>
    );

    expect(getByText('Full Screen')).toBeTruthy();
    expect(getByText('Full Screen Content')).toBeTruthy();
  });

  it('renders gradient variant', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}} title="Gradient Modal" variant="gradient">
        <Text>Gradient Content</Text>
      </Modal>
    );

    expect(getByText('Gradient Modal')).toBeTruthy();
    expect(getByText('Gradient Content')).toBeTruthy();
  });

  it('renders default variant by default', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}} title="Default Modal">
        <Text>Default Content</Text>
      </Modal>
    );

    expect(getByText('Default Modal')).toBeTruthy();
  });

  it('uses title as accessibility label when not provided', () => {
    const { UNSAFE_getByType } = render(
      <Modal visible onClose={() => {}} title="Test Title">
        <Text>Content</Text>
      </Modal>
    );

    const modal = UNSAFE_getByType(require('react-native').Modal);
    expect(modal.props.accessibilityLabel).toBe('Test Title');
  });

  it('uses custom accessibility label when provided', () => {
    const { UNSAFE_getByType } = render(
      <Modal
        visible
        onClose={() => {}}
        title="Test Title"
        accessibilityLabel="Custom Label"
      >
        <Text>Content</Text>
      </Modal>
    );

    const modal = UNSAFE_getByType(require('react-native').Modal);
    expect(modal.props.accessibilityLabel).toBe('Custom Label');
  });

  it('uses default Modal label when no title or accessibilityLabel', () => {
    const { UNSAFE_getByType } = render(
      <Modal visible onClose={() => {}}>
        <Text>Content</Text>
      </Modal>
    );

    const modal = UNSAFE_getByType(require('react-native').Modal);
    expect(modal.props.accessibilityLabel).toBe('Modal');
  });

  it('applies custom style', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}} style={{ backgroundColor: 'red' }}>
        <Text>Styled Content</Text>
      </Modal>
    );

    expect(getByText('Styled Content')).toBeTruthy();
  });

  it('closes when dismiss area is tapped', async () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <Modal visible onClose={onClose}>
        <Text>Content</Text>
      </Modal>
    );

    const dismissArea = getByLabelText('Close modal by tapping outside');
    fireEvent.press(dismissArea);

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });
});
