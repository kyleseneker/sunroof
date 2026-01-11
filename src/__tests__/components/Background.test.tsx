/**
 * Background component tests
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Background } from '@/components/ui';

// Mock dependencies
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('@/lib/unsplash', () => ({
  searchLocationPhoto: jest.fn(),
}));

import { searchLocationPhoto } from '@/lib/unsplash';

describe('Background', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders gradient when no image', () => {
    const { UNSAFE_getByType } = render(<Background />);

    // Should render LinearGradient
    const gradient = UNSAFE_getByType('LinearGradient');
    expect(gradient).toBeTruthy();
  });

  it('uses custom gradient colors', () => {
    const customGradient = ['#000', '#fff'];
    const { UNSAFE_getByType } = render(<Background gradient={customGradient} />);

    const gradient = UNSAFE_getByType('LinearGradient');
    expect(gradient.props.colors).toEqual(customGradient);
  });

  it('renders image when imageUrl provided', () => {
    const { UNSAFE_getAllByType } = render(
      <Background imageUrl="https://example.com/image.jpg" />
    );

    // Should have LinearGradient overlay
    const gradients = UNSAFE_getAllByType('LinearGradient');
    expect(gradients.length).toBeGreaterThan(0);
  });

  it('fetches from Unsplash when unsplashQuery provided', async () => {
    (searchLocationPhoto as jest.Mock).mockResolvedValue({
      url: 'https://unsplash.com/photo.jpg',
    });

    render(<Background unsplashQuery="mountain sunset" />);

    await waitFor(() => {
      expect(searchLocationPhoto).toHaveBeenCalledWith('mountain sunset');
    });
  });

  it('does not fetch when imageUrl is provided', async () => {
    render(
      <Background
        imageUrl="https://example.com/image.jpg"
        unsplashQuery="should not fetch"
      />
    );

    // Wait a bit to ensure no fetch happens
    await new Promise((r) => setTimeout(r, 100));

    expect(searchLocationPhoto).not.toHaveBeenCalled();
  });

  it('handles Unsplash fetch error gracefully', async () => {
    (searchLocationPhoto as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Should not throw
    expect(() => render(<Background unsplashQuery="test" />)).not.toThrow();
  });
});
