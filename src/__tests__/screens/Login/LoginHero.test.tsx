/**
 * LoginHero component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LoginHero } from '@/screens/Login/components/LoginHero';

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: object) => React.createElement(View, props);
});

describe('LoginHero', () => {
  it('renders app name', () => {
    const { getByText } = render(<LoginHero />);

    expect(getByText('Sunroof')).toBeTruthy();
  });

  it('renders tagline', () => {
    const { getByText } = render(<LoginHero />);

    expect(getByText('Capture now. Relive later.')).toBeTruthy();
  });

  it('renders logo image', () => {
    const { UNSAFE_root } = render(<LoginHero />);

    // Find Image component
    const Image = require('react-native').Image;
    const imageElement = UNSAFE_root.findByType(Image);
    expect(imageElement).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<LoginHero />);

    expect(toJSON()).toBeTruthy();
  });
});
