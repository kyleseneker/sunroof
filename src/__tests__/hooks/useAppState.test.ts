/**
 * useAppState hook tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import { useAppState } from '@/hooks/useAppState';

// Mock AppState
const mockAddEventListener = jest.fn();
const mockRemove = jest.fn();

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active' as AppStateStatus,
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

describe('useAppState', () => {
  let changeListener: ((state: AppStateStatus) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    changeListener = null;

    // Capture the event listener
    (AppState.addEventListener as jest.Mock).mockImplementation(
      (event: string, callback: (state: AppStateStatus) => void) => {
        if (event === 'change') {
          changeListener = callback;
        }
        return { remove: mockRemove };
      }
    );

    // Reset AppState.currentState
    (AppState as { currentState: AppStateStatus }).currentState = 'active';
  });

  it('returns current app state', () => {
    const { result } = renderHook(() => useAppState());

    expect(result.current.appState).toBe('active');
    expect(result.current.isActive).toBe(true);
    expect(result.current.isBackground).toBe(false);
    expect(result.current.isInactive).toBe(false);
  });

  it('registers event listener on mount', () => {
    renderHook(() => useAppState());

    expect(AppState.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useAppState());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('updates state when app state changes', () => {
    const { result } = renderHook(() => useAppState());

    expect(result.current.isActive).toBe(true);

    // Simulate going to background
    act(() => {
      changeListener?.('background');
    });

    expect(result.current.appState).toBe('background');
    expect(result.current.isActive).toBe(false);
    expect(result.current.isBackground).toBe(true);
  });

  it('calls onForeground when app comes to foreground', () => {
    const onForeground = jest.fn();

    // Start in background
    (AppState as { currentState: AppStateStatus }).currentState = 'background';

    renderHook(() => useAppState({ onForeground }));

    // Simulate going to foreground
    act(() => {
      changeListener?.('active');
    });

    expect(onForeground).toHaveBeenCalled();
  });

  it('calls onBackground when app goes to background', () => {
    const onBackground = jest.fn();

    renderHook(() => useAppState({ onBackground }));

    // Simulate going to background
    act(() => {
      changeListener?.('background');
    });

    expect(onBackground).toHaveBeenCalled();
  });

  it('calls onChange on any state change', () => {
    const onChange = jest.fn();

    renderHook(() => useAppState({ onChange }));

    // Simulate going to background
    act(() => {
      changeListener?.('background');
    });

    expect(onChange).toHaveBeenCalledWith('background');

    // Simulate going inactive
    act(() => {
      changeListener?.('inactive');
    });

    expect(onChange).toHaveBeenCalledWith('inactive');
  });

  it('handles inactive state correctly', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      changeListener?.('inactive');
    });

    expect(result.current.appState).toBe('inactive');
    expect(result.current.isInactive).toBe(true);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isBackground).toBe(false);
  });

  it('detects foreground from inactive state', () => {
    const onForeground = jest.fn();

    // Start in inactive
    (AppState as { currentState: AppStateStatus }).currentState = 'inactive';

    renderHook(() => useAppState({ onForeground }));

    // Simulate going to active
    act(() => {
      changeListener?.('active');
    });

    expect(onForeground).toHaveBeenCalled();
  });

  it('does not call onForeground when already active', () => {
    const onForeground = jest.fn();

    renderHook(() => useAppState({ onForeground }));

    // Simulate staying active
    act(() => {
      changeListener?.('active');
    });

    expect(onForeground).not.toHaveBeenCalled();
  });

  it('does not call onBackground when not coming from active', () => {
    const onBackground = jest.fn();

    // Start in inactive
    (AppState as { currentState: AppStateStatus }).currentState = 'inactive';

    renderHook(() => useAppState({ onBackground }));

    // Simulate going to background from inactive
    act(() => {
      changeListener?.('background');
    });

    expect(onBackground).not.toHaveBeenCalled();
  });
});

