/**
 * Input component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui';

describe('Input', () => {
  it('renders without label or error', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Input label="Email" placeholder="Enter email" />
    );

    expect(getByText('Email')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByText } = render(
      <Input placeholder="Enter email" error="Invalid email address" />
    );

    expect(getByText('Invalid email address')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByPlaceholderText('Enter text'), 'Hello');

    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('uses label as accessibility label when not provided', () => {
    const { getByLabelText } = render(
      <Input label="Username" placeholder="Enter username" />
    );

    expect(getByLabelText('Username')).toBeTruthy();
  });

  it('uses custom accessibility label when provided', () => {
    const { getByLabelText } = render(
      <Input
        label="Username"
        accessibilityLabel="Your username"
        placeholder="Enter username"
      />
    );

    expect(getByLabelText('Your username')).toBeTruthy();
  });

  it('renders with accessibility hint', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter email"
        accessibilityHint="Enter your email address"
      />
    );

    const input = getByPlaceholderText('Enter email');
    expect(input.props.accessibilityHint).toBe('Enter your email address');
  });

  it('applies disabled state correctly', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" editable={false} />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.editable).toBe(false);
  });

  it('applies custom container style', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        containerStyle={{ marginTop: 20 }}
      />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('applies custom input style', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        inputStyle={{ fontSize: 20 }}
      />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });
});
