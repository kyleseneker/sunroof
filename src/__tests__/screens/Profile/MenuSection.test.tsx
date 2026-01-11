/**
 * MenuSection component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { MenuSection } from '@/screens/Profile/components/MenuSection';

describe('MenuSection', () => {
  it('renders children', () => {
    const { getByText } = render(
      <MenuSection>
        <Text>Menu Item 1</Text>
        <Text>Menu Item 2</Text>
      </MenuSection>
    );

    expect(getByText('Menu Item 1')).toBeTruthy();
    expect(getByText('Menu Item 2')).toBeTruthy();
  });

  it('renders with single child', () => {
    const { getByText } = render(
      <MenuSection>
        <Text>Single Item</Text>
      </MenuSection>
    );

    expect(getByText('Single Item')).toBeTruthy();
  });

  it('renders container view', () => {
    const { UNSAFE_root } = render(
      <MenuSection>
        <Text>Content</Text>
      </MenuSection>
    );

    const View = require('react-native').View;
    const views = UNSAFE_root.findAllByType(View);
    expect(views.length).toBeGreaterThan(0);
  });

  it('renders without crashing with no content', () => {
    const { toJSON } = render(
      <MenuSection>
        <></>
      </MenuSection>
    );

    expect(toJSON()).toBeTruthy();
  });
});
