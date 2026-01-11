/**
 * useAsyncCallback hook tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAsyncCallback } from '@/hooks/useAsyncCallback';

describe('useAsyncCallback', () => {
  it('starts in idle state', () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('sets isLoading to true during execution', async () => {
    let resolve: (value: string) => void = () => {};
    const asyncFn = jest.fn(
      () => new Promise<string>((r) => { resolve = r; })
    );

    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolve('done');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns data on success', async () => {
    const asyncFn = jest.fn().mockResolvedValue({ id: '123', name: 'Test' });

    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual({ id: '123', name: 'Test' });
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const asyncFn = jest.fn().mockRejectedValue(new Error('Something went wrong'));

    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('Something went wrong');
    expect(result.current.data).toBeNull();
  });

  it('passes arguments to async function', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result');

    const { result } = renderHook(() =>
      useAsyncCallback(asyncFn)
    );

    await act(async () => {
      await result.current.execute('arg1', 'arg2');
    });

    expect(asyncFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('calls onSuccess callback', async () => {
    const onSuccess = jest.fn();
    const asyncFn = jest.fn().mockResolvedValue('success-data');

    const { result } = renderHook(() =>
      useAsyncCallback(asyncFn, { onSuccess })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledWith('success-data');
  });

  it('calls onError callback', async () => {
    const onError = jest.fn();
    const asyncFn = jest.fn().mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() =>
      useAsyncCallback(asyncFn, { onError })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onError).toHaveBeenCalledWith('Failed');
  });

  it('uses initialData', () => {
    const asyncFn = jest.fn().mockResolvedValue('new data');

    const { result } = renderHook(() =>
      useAsyncCallback(asyncFn, { initialData: 'initial' })
    );

    expect(result.current.data).toBe('initial');
  });

  it('reset restores initial state', async () => {
    const asyncFn = jest.fn().mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAsyncCallback(asyncFn, { initialData: 'initial' })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe('data');

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe('initial');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears error on new execution', async () => {
    const asyncFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce('success');

    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    // First execution - error
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.error).toBe('First error');

    // Second execution - success
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe('success');
  });

  it('returns result from execute', async () => {
    const asyncFn = jest.fn().mockResolvedValue('return-value');

    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    let returnValue: string | null = null;
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(returnValue).toBe('return-value');
  });

  it('returns null on error', async () => {
    const asyncFn = jest.fn().mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    let returnValue: unknown = 'not-null';
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(returnValue).toBeNull();
  });

  it('handles non-Error thrown values', async () => {
    const asyncFn = jest.fn().mockRejectedValue('string error');

    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('An error occurred');
  });
});
