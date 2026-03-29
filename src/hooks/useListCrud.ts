import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { swrFetcher } from '../lib/swrFetcher';
import { addToast } from '../lib/toast';

/** Stable default so useMemo SWR key does not change every render when extraParams is omitted. */
const EMPTY_EXTRA_PARAMS: Record<string, string> = {};

export interface UseListCrudOptions {
  defaultLimit?: number;
  /** Query param name for status/filter (default 'status'; use 'resolved' for inquiries) */
  statusParamName?: string;
  /** Extra query params (use useMemo in the caller so the SWR key does not change every render). */
  extraParams?: Record<string, string>;
}

export type ListResponse<T = unknown> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export interface UseListCrudReturn<T = unknown> {
  data: ListResponse<T> | undefined;
  mutate: () => void;
  isLoading: boolean;
  q: string;
  setQ: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  page: number;
  setPage: (n: number) => void;
  limit: number;
  setLimit: (n: number) => void;
  handleReset: () => void;
}

/**
 * Shared hook for admin list pages: SWR + pagination + search + status filter.
 * Use one hook per resource (e.g. useListCrud('/blog')), then pass columns and UI.
 */
export function useListCrud(
  endpoint: string,
  options: UseListCrudOptions = {}
): UseListCrudReturn {
  const { defaultLimit = 10, statusParamName = 'status', extraParams = EMPTY_EXTRA_PARAMS } = options;
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);

  const key = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set(statusParamName, status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return `${endpoint}?${params.toString()}`;
  }, [endpoint, q, status, page, limit, statusParamName, extraParams]);

  const { data, mutate, isLoading } = useSWR<ListResponse>(key, swrFetcher);

  const handleReset = () => {
    setQ('');
    setStatus('');
    setPage(1);
    mutate();
    addToast('Filters cleared', 'success', 1500);
  };

  return {
    data,
    mutate,
    isLoading,
    q,
    setQ,
    status,
    setStatus,
    page,
    setPage,
    limit,
    setLimit,
    handleReset,
  };
}
