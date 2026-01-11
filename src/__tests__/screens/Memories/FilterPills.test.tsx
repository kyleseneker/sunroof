/**
 * FilterPills component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterPills, FilterType } from '@/screens/Memories/components/FilterPills';

// Mock haptics
jest.mock('@/lib', () => ({
  hapticClick: jest.fn(),
}));

import { hapticClick } from '@/lib';

const mockFilters = [
  { key: 'all' as FilterType, label: 'All', count: 10 },
  { key: 'photo' as FilterType, label: 'Photo', count: 5 },
  { key: 'video' as FilterType, label: 'Video', count: 2 },
  { key: 'audio' as FilterType, label: 'Audio', count: 2 },
  { key: 'text' as FilterType, label: 'Text', count: 1 },
];

describe('FilterPills', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter labels', () => {
    const { getByText } = render(
      <FilterPills
        filters={mockFilters}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(getByText('All')).toBeTruthy();
    expect(getByText('Photo')).toBeTruthy();
    expect(getByText('Video')).toBeTruthy();
    expect(getByText('Audio')).toBeTruthy();
    expect(getByText('Text')).toBeTruthy();
  });

  it('renders filter counts', () => {
    const { getByText, getAllByText } = render(
      <FilterPills
        filters={mockFilters}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(getByText('10')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    // Video and Audio both have count 2
    expect(getAllByText('2')).toHaveLength(2);
    expect(getByText('1')).toBeTruthy();
  });

  it('calls onFilterChange when filter is pressed', () => {
    const { getByText } = render(
      <FilterPills
        filters={mockFilters}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.press(getByText('Photo'));

    expect(mockOnFilterChange).toHaveBeenCalledWith('photo');
  });

  it('triggers haptic feedback when filter is pressed', () => {
    const { getByText } = render(
      <FilterPills
        filters={mockFilters}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.press(getByText('Video'));

    expect(hapticClick).toHaveBeenCalledTimes(1);
  });

  it('can change active filter', () => {
    const { getByText, rerender } = render(
      <FilterPills
        filters={mockFilters}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    rerender(
      <FilterPills
        filters={mockFilters}
        activeFilter="photo"
        onFilterChange={mockOnFilterChange}
      />
    );

    // Just verify it renders without error after changing activeFilter
    expect(getByText('Photo')).toBeTruthy();
  });

  it('renders with single filter', () => {
    const singleFilter = [{ key: 'all' as FilterType, label: 'All', count: 3 }];

    const { getByText } = render(
      <FilterPills
        filters={singleFilter}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(getByText('All')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('handles zero count', () => {
    const filtersWithZero = [
      { key: 'all' as FilterType, label: 'All', count: 0 },
    ];

    const { getByText } = render(
      <FilterPills
        filters={filtersWithZero}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(getByText('0')).toBeTruthy();
  });
});
