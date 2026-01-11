/**
 * OfflineProvider tests
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { OfflineProvider, useOffline } from '@/providers/OfflineProvider';

// Mock dependencies
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
}));

jest.mock('@/lib/offlineStore', () => ({
  offlineStore: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getPendingCount: jest.fn().mockResolvedValue(0),
    subscribe: jest.fn(() => jest.fn()),
    getMemoriesToSync: jest.fn().mockResolvedValue([]),
    clearFailedMemories: jest.fn().mockResolvedValue(undefined),
    getPendingForJourney: jest.fn().mockResolvedValue([]),
    updateMemoryStatus: jest.fn().mockResolvedValue(undefined),
    removePendingMemory: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('@/services', () => ({
  uploadMemoryPhoto: jest.fn(),
  uploadMemoryVideo: jest.fn(),
  uploadMemoryAudio: jest.fn(),
  createMemory: jest.fn(),
}));

import NetInfo from '@react-native-community/netinfo';
import { offlineStore } from '@/lib/offlineStore';

// Helper component to access context
const TestConsumer = () => {
  const {
    isOnline,
    isConnecting,
    pendingCount,
    isSyncing,
    needsManualSync,
  } = useOffline();

  return (
    <>
      <Text testID="isOnline">{String(isOnline)}</Text>
      <Text testID="isConnecting">{String(isConnecting)}</Text>
      <Text testID="pendingCount">{String(pendingCount)}</Text>
      <Text testID="isSyncing">{String(isSyncing)}</Text>
      <Text testID="needsManualSync">{String(needsManualSync)}</Text>
    </>
  );
};

describe('OfflineProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (offlineStore.getPendingCount as jest.Mock).mockResolvedValue(0);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  it('renders children', async () => {
    const { getByText } = render(
      <OfflineProvider>
        <Text>Test Child</Text>
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(getByText('Test Child')).toBeTruthy();
    });
  });

  it('throws error if useOffline is used outside provider', () => {
    const TestWithoutProvider = () => {
      useOffline();
      return null;
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestWithoutProvider />)).toThrow(
      'useOffline must be used within an OfflineProvider'
    );
    jest.restoreAllMocks();
  });

  it('initializes with online state', async () => {
    const { getByTestId } = render(
      <OfflineProvider>
        <TestConsumer />
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isOnline').props.children).toBe('true');
    });
  });

  it('initializes the offline store', async () => {
    render(
      <OfflineProvider>
        <TestConsumer />
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(offlineStore.initialize).toHaveBeenCalledTimes(1);
    });
  });

  it('loads pending count on mount', async () => {
    (offlineStore.getPendingCount as jest.Mock).mockResolvedValue(5);

    const { getByTestId } = render(
      <OfflineProvider>
        <TestConsumer />
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(getByTestId('pendingCount').props.children).toBe('5');
    });
  });

  it('sets needsManualSync when launching with pending items', async () => {
    (offlineStore.getPendingCount as jest.Mock).mockResolvedValue(3);

    const { getByTestId } = render(
      <OfflineProvider>
        <TestConsumer />
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(getByTestId('needsManualSync').props.children).toBe('true');
    });
  });

  it('subscribes to pending count changes', async () => {
    render(
      <OfflineProvider>
        <TestConsumer />
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(offlineStore.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  it('updates pending count when subscription fires', async () => {
    let subscribeCallback: (count: number) => void = () => {};
    (offlineStore.subscribe as jest.Mock).mockImplementation((cb) => {
      subscribeCallback = cb;
      return jest.fn();
    });

    const { getByTestId } = render(
      <OfflineProvider>
        <TestConsumer />
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(getByTestId('pendingCount').props.children).toBe('0');
    });

    // Simulate pending count update
    act(() => {
      subscribeCallback(2);
    });

    await waitFor(() => {
      expect(getByTestId('pendingCount').props.children).toBe('2');
    });
  });

  it('provides getPendingForJourney function', async () => {
    const mockPending = [{ id: '1', type: 'photo' }];
    (offlineStore.getPendingForJourney as jest.Mock).mockResolvedValue(mockPending);

    const TestWithGet = () => {
      const { getPendingForJourney } = useOffline();
      const [count, setCount] = React.useState(0);

      React.useEffect(() => {
        getPendingForJourney('journey-1').then((result) => {
          setCount(result.length);
        });
      }, [getPendingForJourney]);

      return <Text testID="count">{count}</Text>;
    };

    const { getByTestId } = render(
      <OfflineProvider>
        <TestWithGet />
      </OfflineProvider>
    );

    await waitFor(() => {
      expect(getByTestId('count').props.children).toBe(1);
    });
  });

  describe('network state changes', () => {
    it('listens for network changes', async () => {
      render(
        <OfflineProvider>
          <TestConsumer />
        </OfflineProvider>
      );

      await waitFor(() => {
        expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
      });
    });

    it('fetches initial network state', async () => {
      render(
        <OfflineProvider>
          <TestConsumer />
        </OfflineProvider>
      );

      await waitFor(() => {
        expect(NetInfo.fetch).toHaveBeenCalled();
      });
    });
  });
});
