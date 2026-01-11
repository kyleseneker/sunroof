/**
 * ModeSwitcher component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ModeSwitcher } from '@/screens/Camera/components/ModeSwitcher';

// Mock haptics
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib';

describe('ModeSwitcher', () => {
  const mockOnModeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all mode buttons', () => {
    const { getByText } = render(
      <ModeSwitcher currentMode="photo" onModeChange={mockOnModeChange} />
    );

    expect(getByText('Photo')).toBeTruthy();
    expect(getByText('Video')).toBeTruthy();
    expect(getByText('Audio')).toBeTruthy();
    expect(getByText('Note')).toBeTruthy();
  });

  it('calls onModeChange when mode is pressed', () => {
    const { getByLabelText } = render(
      <ModeSwitcher currentMode="photo" onModeChange={mockOnModeChange} />
    );

    fireEvent.press(getByLabelText('Switch to Video mode'));

    expect(mockOnModeChange).toHaveBeenCalledWith('video');
  });

  it('triggers haptic feedback on mode change', () => {
    const { getByLabelText } = render(
      <ModeSwitcher currentMode="photo" onModeChange={mockOnModeChange} />
    );

    fireEvent.press(getByLabelText('Switch to Audio mode'));

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('sets selected state on current mode', () => {
    const { getByLabelText } = render(
      <ModeSwitcher currentMode="video" onModeChange={mockOnModeChange} />
    );

    const videoButton = getByLabelText('Switch to Video mode');
    expect(videoButton.props.accessibilityState.selected).toBe(true);
  });

  it('sets unselected state on other modes', () => {
    const { getByLabelText } = render(
      <ModeSwitcher currentMode="video" onModeChange={mockOnModeChange} />
    );

    const photoButton = getByLabelText('Switch to Photo mode');
    expect(photoButton.props.accessibilityState.selected).toBe(false);
  });

  it('can switch to text mode', () => {
    const { getByLabelText } = render(
      <ModeSwitcher currentMode="photo" onModeChange={mockOnModeChange} />
    );

    fireEvent.press(getByLabelText('Switch to Note mode'));

    expect(mockOnModeChange).toHaveBeenCalledWith('text');
  });

  it('renders with audio mode selected', () => {
    const { getByLabelText } = render(
      <ModeSwitcher currentMode="audio" onModeChange={mockOnModeChange} />
    );

    const audioButton = getByLabelText('Switch to Audio mode');
    expect(audioButton.props.accessibilityState.selected).toBe(true);
  });
});
