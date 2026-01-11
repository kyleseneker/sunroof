/**
 * Badge component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '@/components/ui';

describe('Badge', () => {
  it('renders children text', () => {
    const { getByText } = render(
      <Badge>New</Badge>
    );

    expect(getByText('New')).toBeTruthy();
  });

  it('renders with default variant', () => {
    const { getByText } = render(
      <Badge>Label</Badge>
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('renders with success variant', () => {
    const { getByText } = render(
      <Badge variant="success">Complete</Badge>
    );

    expect(getByText('Complete')).toBeTruthy();
  });

  it('renders with error variant', () => {
    const { getByText } = render(
      <Badge variant="error">Failed</Badge>
    );

    expect(getByText('Failed')).toBeTruthy();
  });

  it('renders with warning variant', () => {
    const { getByText } = render(
      <Badge variant="warning">Pending</Badge>
    );

    expect(getByText('Pending')).toBeTruthy();
  });

  it('renders with info variant', () => {
    const { getByText } = render(
      <Badge variant="info">Info</Badge>
    );

    expect(getByText('Info')).toBeTruthy();
  });

  it('applies custom style', () => {
    const { getByText } = render(
      <Badge style={{ marginLeft: 10 }}>Custom</Badge>
    );

    expect(getByText('Custom')).toBeTruthy();
  });

  it('renders with multiple text fragments', () => {
    const { getByText } = render(
      <Badge>Count: 5</Badge>
    );

    expect(getByText('Count: 5')).toBeTruthy();
  });
});
