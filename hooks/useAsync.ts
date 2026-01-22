
import { useState, useCallback, useEffect } from 'react';

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

export interface AsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export const useAsync = <T>(
  asyncFunction: AsyncFunction<T>,
  immediate = true
): AsyncState<T> => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // The execute function wraps asyncFunction and handles state updates
  const execute = useCallback(
    async (...args: any[]) => {
      setStatus('pending');
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
        setStatus('error');
        // Log to console for debugging, normally sent to monitoring service
        console.error("Async Hook Error:", err); 
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  // Call execute if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { status, data, error, execute, reset };
};
