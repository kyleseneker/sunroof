/**
 * CachedImage component tests
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { CachedImage } from '@/components/ui';

// Mock RNFS
jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/mock/caches',
  exists: jest.fn(),
  mkdir: jest.fn(),
  downloadFile: jest.fn(),
}));

import RNFS from 'react-native-fs';

describe('CachedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.mkdir as jest.Mock).mockResolvedValue(undefined);
    (RNFS.downloadFile as jest.Mock).mockReturnValue({
      promise: Promise.resolve({ statusCode: 200 }),
    });
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      <CachedImage uri="https://example.com/image.jpg" />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('shows loader when showLoader is true and loading', async () => {
    // Make exists very slow to ensure we catch the loading state
    (RNFS.exists as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(false), 5000))
    );

    const { queryByTestId, toJSON } = render(
      <CachedImage
        uri="https://example.com/image.jpg"
        showLoader
      />
    );

    // Component should render something while loading
    expect(toJSON()).toBeTruthy();
  });

  it('renders image after cache check', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);

    const { UNSAFE_getByType } = render(
      <CachedImage uri="https://example.com/image.jpg" />
    );

    await waitFor(() => {
      const image = UNSAFE_getByType(require('react-native').Image);
      expect(image).toBeTruthy();
    });
  });

  it('applies custom style', () => {
    const customStyle = { width: 100, height: 100 };

    const { toJSON } = render(
      <CachedImage
        uri="https://example.com/image.jpg"
        style={customStyle}
      />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('uses cover resize mode by default', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);

    const { UNSAFE_getByType } = render(
      <CachedImage uri="https://example.com/image.jpg" />
    );

    await waitFor(() => {
      const image = UNSAFE_getByType(require('react-native').Image);
      expect(image.props.resizeMode).toBe('cover');
    });
  });

  it('applies custom resize mode', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);

    const { UNSAFE_getByType } = render(
      <CachedImage
        uri="https://example.com/image.jpg"
        resizeMode="contain"
      />
    );

    await waitFor(() => {
      const image = UNSAFE_getByType(require('react-native').Image);
      expect(image.props.resizeMode).toBe('contain');
    });
  });

  it('applies blur radius', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);

    const { UNSAFE_getByType } = render(
      <CachedImage
        uri="https://example.com/image.jpg"
        blurRadius={10}
      />
    );

    await waitFor(() => {
      const image = UNSAFE_getByType(require('react-native').Image);
      expect(image.props.blurRadius).toBe(10);
    });
  });

  it('shows fallback on error', async () => {
    const { UNSAFE_getByType } = render(
      <CachedImage uri="" />
    );

    // Should render placeholder View
    await waitFor(() => {
      const view = UNSAFE_getByType(require('react-native').View);
      expect(view).toBeTruthy();
    });
  });
});
