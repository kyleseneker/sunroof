/**
 * useAsyncCallback hook
 * Wraps async functions with loading and error state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface AsyncCallbackReturn<T, Args extends unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Manage async operations with built-in loading and error state
 *
 * @param asyncFn - The async function to execute
 * @param options - Optional configuration
 *
 * @example
 * const { execute, isLoading, error, data } = useAsyncCallback(
 *   async (userId: string) => {
 *     const response = await api.fetchUser(userId);
 *     return response.data;
 *   },
 *   { onSuccess: (user) => console.log('Fetched:', user) }
 * );
 *
 * // Later in your component
 * <Button onPress={() => execute('user-123')} loading={isLoading}>
 *   Fetch User
 * </Button>
 */
export function useAsyncCallback<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    initialData?: T | null;
  }
): AsyncCallbackReturn<T, Args> {
  const [state, setState] = useState<AsyncState<T>>({
    data: options?.initialData ?? null,
    error: null,
    isLoading: false,
  });

  // Track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);

  // Store latest callbacks to avoid stale closures
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFn(...args);

        if (isMounted.current) {
          setState({ data: result, error: null, isLoading: false });
          optionsRef.current?.onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';

        if (isMounted.current) {
          setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
          optionsRef.current?.onError?.(errorMessage);
        }

        return null;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    setState({
      data: options?.initialData ?? null,
      error: null,
      isLoading: false,
    });
  }, [options?.initialData]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

