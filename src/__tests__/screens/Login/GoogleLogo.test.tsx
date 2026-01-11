/**
 * GoogleLogo component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { GoogleLogo } from '@/screens/Login/components/GoogleLogo';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: object) => React.createElement(View, props),
    Svg: (props: object) => React.createElement(View, props),
    Path: () => null,
  };
});

describe('GoogleLogo', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<GoogleLogo />);

    expect(toJSON()).toBeTruthy();
  });

  it('uses default size of 20', () => {
    const { UNSAFE_root } = render(<GoogleLogo />);

    // Find the Svg mock (which is a View with width/height props)
    const svgElement = UNSAFE_root.findByProps({ viewBox: '0 0 24 24' });
    expect(svgElement.props.width).toBe(20);
    expect(svgElement.props.height).toBe(20);
  });

  it('uses custom size', () => {
    const { UNSAFE_root } = render(<GoogleLogo size={32} />);

    const svgElement = UNSAFE_root.findByProps({ viewBox: '0 0 24 24' });
    expect(svgElement.props.width).toBe(32);
    expect(svgElement.props.height).toBe(32);
  });
});
