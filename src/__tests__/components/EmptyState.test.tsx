/**
 * EmptyState component tests
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '@/components/ui';

describe('EmptyState', () => {
  const TestIcon = () => <Text testID="icon">📭</Text>;

  it('renders icon and title', () => {
    const { getByText, getByTestId } = render(
      <EmptyState icon={<TestIcon />} title="No items found" />
    );

    expect(getByTestId('icon')).toBeTruthy();
    expect(getByText('No items found')).toBeTruthy();
  });

  it('renders description when provided', () => {
    const { getByText } = render(
      <EmptyState
        icon={<TestIcon />}
        title="No items"
        description="Try adding something new"
      />
    );

    expect(getByText('Try adding something new')).toBeTruthy();
  });

  it('does not render description when not provided', () => {
    const { queryByText } = render(
      <EmptyState icon={<TestIcon />} title="No items" />
    );

    expect(queryByText('Try adding something new')).toBeNull();
  });

  it('renders action when provided', () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <EmptyState
        icon={<TestIcon />}
        title="No items"
        action={
          <TouchableOpacity onPress={onPress}>
            <Text>Add Item</Text>
          </TouchableOpacity>
        }
      />
    );

    const button = getByText('Add Item');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('does not render action when not provided', () => {
    const { queryByText } = render(
      <EmptyState icon={<TestIcon />} title="No items" />
    );

    expect(queryByText('Add Item')).toBeNull();
  });

  it('applies custom style', () => {
    const { getByText } = render(
      <EmptyState
        icon={<TestIcon />}
        title="No items"
        style={{ marginTop: 50 }}
      />
    );

    expect(getByText('No items')).toBeTruthy();
  });
});
