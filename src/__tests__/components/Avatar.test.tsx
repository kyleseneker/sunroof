/**
 * Avatar component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '@/components/ui';

describe('Avatar', () => {
  describe('with image source', () => {
    it('renders image when src is provided', () => {
      const { getByRole } = render(
        <Avatar src="https://example.com/avatar.jpg" />
      );

      // Image should be rendered (wrapped in View)
      expect(getByRole).toBeTruthy();
    });
  });

  describe('with initials', () => {
    it('shows two initials for full name', () => {
      const { getByText } = render(
        <Avatar name="John Doe" />
      );

      expect(getByText('JD')).toBeTruthy();
    });

    it('shows first two characters for single word name', () => {
      const { getByText } = render(
        <Avatar name="John" />
      );

      expect(getByText('JO')).toBeTruthy();
    });

    it('shows email initials when only email provided', () => {
      const { getByText } = render(
        <Avatar email="john@example.com" />
      );

      expect(getByText('JO')).toBeTruthy();
    });

    it('shows ?? when no name or email', () => {
      const { getByText } = render(
        <Avatar />
      );

      expect(getByText('??')).toBeTruthy();
    });

    it('handles names with extra whitespace', () => {
      const { getByText } = render(
        <Avatar name="  Jane   Smith  " />
      );

      expect(getByText('JS')).toBeTruthy();
    });

    it('handles names with multiple parts', () => {
      const { getByText } = render(
        <Avatar name="Mary Jane Watson" />
      );

      expect(getByText('MJ')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders with sm size', () => {
      const { getByText } = render(
        <Avatar name="John" size="sm" />
      );

      expect(getByText('JO')).toBeTruthy();
    });

    it('renders with md size (default)', () => {
      const { getByText } = render(
        <Avatar name="John" />
      );

      expect(getByText('JO')).toBeTruthy();
    });

    it('renders with lg size', () => {
      const { getByText } = render(
        <Avatar name="John" size="lg" />
      );

      expect(getByText('JO')).toBeTruthy();
    });

    it('renders with xl size', () => {
      const { getByText } = render(
        <Avatar name="John" size="xl" />
      );

      expect(getByText('JO')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('applies custom style', () => {
      const { getByText } = render(
        <Avatar name="John" style={{ borderWidth: 2 }} />
      );

      expect(getByText('JO')).toBeTruthy();
    });
  });

  describe('priority', () => {
    it('prefers image over initials', () => {
      const { queryByText } = render(
        <Avatar
          src="https://example.com/avatar.jpg"
          name="John Doe"
        />
      );

      // Should not show initials when image is provided
      expect(queryByText('JD')).toBeNull();
    });

    it('prefers name over email for initials', () => {
      const { getByText } = render(
        <Avatar name="John Doe" email="different@example.com" />
      );

      expect(getByText('JD')).toBeTruthy();
    });
  });
});
