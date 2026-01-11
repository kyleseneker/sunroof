/**
 * CaptureButtons component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CaptureButtons } from '@/screens/Home/components/CaptureButtons';

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: object) => React.createElement(View, props);
});

describe('CaptureButtons', () => {
  const mockOnCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all capture buttons', () => {
    const { getByText } = render(
      <CaptureButtons onCapture={mockOnCapture} />
    );

    expect(getByText('Photo')).toBeTruthy();
    expect(getByText('Video')).toBeTruthy();
    expect(getByText('Audio')).toBeTruthy();
    expect(getByText('Note')).toBeTruthy();
  });

  it('renders accessibility labels for all buttons', () => {
    const { getByLabelText } = render(
      <CaptureButtons onCapture={mockOnCapture} />
    );

    expect(getByLabelText('Capture photo')).toBeTruthy();
    expect(getByLabelText('Capture video')).toBeTruthy();
    expect(getByLabelText('Capture audio')).toBeTruthy();
    expect(getByLabelText('Capture note')).toBeTruthy();
  });

  it('calls onCapture with photo mode', () => {
    const { getByLabelText } = render(
      <CaptureButtons onCapture={mockOnCapture} />
    );

    fireEvent.press(getByLabelText('Capture photo'));

    expect(mockOnCapture).toHaveBeenCalledWith('photo');
  });

  it('calls onCapture with video mode', () => {
    const { getByLabelText } = render(
      <CaptureButtons onCapture={mockOnCapture} />
    );

    fireEvent.press(getByLabelText('Capture video'));

    expect(mockOnCapture).toHaveBeenCalledWith('video');
  });

  it('calls onCapture with audio mode', () => {
    const { getByLabelText } = render(
      <CaptureButtons onCapture={mockOnCapture} />
    );

    fireEvent.press(getByLabelText('Capture audio'));

    expect(mockOnCapture).toHaveBeenCalledWith('audio');
  });

  it('calls onCapture with text mode', () => {
    const { getByLabelText } = render(
      <CaptureButtons onCapture={mockOnCapture} />
    );

    fireEvent.press(getByLabelText('Capture note'));

    expect(mockOnCapture).toHaveBeenCalledWith('text');
  });

  it('renders buttons with correct role', () => {
    const { getByLabelText } = render(
      <CaptureButtons onCapture={mockOnCapture} />
    );

    const photoButton = getByLabelText('Capture photo');
    expect(photoButton.props.accessibilityRole).toBe('button');
  });
});
