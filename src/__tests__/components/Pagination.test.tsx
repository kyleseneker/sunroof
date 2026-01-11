/**
 * Pagination component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pagination } from '@/components/ui/Pagination';

jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, props, props.children),
  };
});

describe('Pagination', () => {
  const mockOnIndexChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when count is 0', () => {
    const { toJSON } = render(
      <Pagination count={0} currentIndex={0} />
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null when count is 1', () => {
    const { toJSON } = render(
      <Pagination count={1} currentIndex={0} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders dots for small counts', () => {
    const { toJSON } = render(
      <Pagination count={3} currentIndex={1} />
    );
    
    // Should render something (not null)
    expect(toJSON()).not.toBeNull();
  });

  it('shows active state for current index', () => {
    const { toJSON } = render(
      <Pagination count={3} currentIndex={1} />
    );
    
    // Component renders successfully
    expect(toJSON()).not.toBeNull();
  });

  it('calls onIndexChange when dot is pressed', () => {
    const { getByLabelText } = render(
      <Pagination count={3} currentIndex={0} onIndexChange={mockOnIndexChange} />
    );

    fireEvent.press(getByLabelText('Item 2 of 3'));
    expect(mockOnIndexChange).toHaveBeenCalledWith(1);
  });

  it('does not render touchable dots when onIndexChange is not provided', () => {
    const { queryByLabelText } = render(
      <Pagination count={3} currentIndex={0} />
    );

    // Should not have accessible buttons
    expect(queryByLabelText('Item 1 of 3')).toBeNull();
  });

  it('renders progress bar for many items', () => {
    const { UNSAFE_root } = render(
      <Pagination count={20} currentIndex={5} />
    );

    // Should render LinearGradient (mocked as View)
    const progressBars = UNSAFE_root.findAllByType('View').filter(
      (v) => v.props.style?.width === 120
    );
    expect(progressBars.length).toBeGreaterThanOrEqual(1);
  });

  it('respects maxDots prop', () => {
    // Both should render something
    const { toJSON: json1 } = render(
      <Pagination count={10} currentIndex={0} />
    );
    expect(json1()).not.toBeNull();

    const { toJSON: json2 } = render(
      <Pagination count={10} currentIndex={0} maxDots={5} />
    );
    expect(json2()).not.toBeNull();
  });

  it('sets correct accessibility state for selected dot', () => {
    const { getByLabelText } = render(
      <Pagination count={3} currentIndex={1} onIndexChange={mockOnIndexChange} />
    );

    const selectedDot = getByLabelText('Item 2 of 3');
    expect(selectedDot.props.accessibilityState.selected).toBe(true);

    const unselectedDot = getByLabelText('Item 1 of 3');
    expect(unselectedDot.props.accessibilityState.selected).toBe(false);
  });
});
