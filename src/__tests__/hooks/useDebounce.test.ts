/**
 * useDebounce hook tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('does not update value immediately on change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should still be initial value
    expect(result.current).toBe('initial');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Fast-forward past the delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Not yet updated at 299ms
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    // Updated at 300ms
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('cancels previous timer on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    // Rapid updates
    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'third' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'fourth' });

    // Still at first value
    expect(result.current).toBe('first');

    // Wait for full delay after last update
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should be the last value
    expect(result.current).toBe('fourth');
  });

  it('works with different types', () => {
    // Number
    const { result: numberResult } = renderHook(() => useDebounce(42, 100));
    expect(numberResult.current).toBe(42);

    // Object
    const obj = { key: 'value' };
    const { result: objResult } = renderHook(() => useDebounce(obj, 100));
    expect(objResult.current).toEqual(obj);

    // Array
    const arr = [1, 2, 3];
    const { result: arrResult } = renderHook(() => useDebounce(arr, 100));
    expect(arrResult.current).toEqual(arr);
  });

  it('cleans up timer on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    // Should not throw when timers fire after unmount
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(300);
      });
    }).not.toThrow();
  });
});
