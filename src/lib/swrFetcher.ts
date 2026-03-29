import { api } from './api';

/**
 * SWR fetcher for admin API calls.
 * Single source of truth — use this instead of defining fetcher in each page.
 */
export function swrFetcher<T = unknown>(url: string): Promise<T> {
  return api.get(url).then((res) => res.data);
}
