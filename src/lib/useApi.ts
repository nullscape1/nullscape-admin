import { useCallback, useState } from 'react';
import { addToast } from './toast';

type ApiFn<TArgs extends any[], TRes> = (...args: TArgs) => Promise<TRes>;

export function useApi<TArgs extends any[], TRes>(fn: ApiFn<TArgs, TRes>, messages?: { success?: string; error?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const call = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError('');
    try {
      const res = await fn(...args);
      if (messages?.success) addToast(messages.success, 'success');
      return res;
    } catch (err: any) {
      const msg = err?.response?.data?.message || messages?.error || 'Something went wrong';
      setError(msg);
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn, messages]);

  return { call, loading, error, setError };
}



