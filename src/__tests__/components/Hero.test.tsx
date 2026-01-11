/**
 * Hero component tests
 */

import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Hero } from '@/components/ui';

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => {
  const { View } = require('react-native');
  return ({ children, style }: any) => <View style={style}>{children}</View>;
});

describe('Hero', () => {
  const TestIcon = () => <Text testID="icon">🌟</Text>;

  it('renders title', () => {
    const { getByText } = render(
      <Hero icon={<TestIcon />} title="Test Title" />
    );

    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders icon', () => {
    const { getByTestId } = render(
      <Hero icon={<TestIcon />} title="Test Title" />
    );

    expect(getByTestId('icon')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <Hero icon={<TestIcon />} title="Title" subtitle="Subtitle text" />
    );

    expect(getByText('Subtitle text')).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByText } = render(
      <Hero icon={<TestIcon />} title="Title" />
    );

    // No subtitle should be present
    expect(queryByText('Subtitle text')).toBeNull();
  });

  it('renders children when provided', () => {
    const { getByText } = render(
      <Hero icon={<TestIcon />} title="Title">
        <Text>Extra content</Text>
      </Hero>
    );

    expect(getByText('Extra content')).toBeTruthy();
  });

  it('renders with md iconSize', () => {
    const { getByTestId } = render(
      <Hero icon={<TestIcon />} title="Title" iconSize="md" />
    );

    expect(getByTestId('icon')).toBeTruthy();
  });

  it('renders with lg iconSize', () => {
    const { getByTestId } = render(
      <Hero icon={<TestIcon />} title="Title" iconSize="lg" />
    );

    expect(getByTestId('icon')).toBeTruthy();
  });

  it('renders with different titleSize variants', () => {
    const sizes = ['md', 'lg', 'xl'] as const;

    sizes.forEach((size) => {
      const { getByText } = render(
        <Hero icon={<TestIcon />} title={`Size ${size}`} titleSize={size} />
      );

      expect(getByText(`Size ${size}`)).toBeTruthy();
    });
  });

  it('applies custom style', () => {
    const { getByText } = render(
      <Hero
        icon={<TestIcon />}
        title="Title"
        style={{ marginTop: 100 }}
      />
    );

    expect(getByText('Title')).toBeTruthy();
  });
});
