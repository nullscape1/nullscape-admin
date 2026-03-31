import { api } from './api';
import type { BareFetcher } from 'swr';

/**
 * SWR fetcher for admin API calls.
 * Single source of truth — use this instead of defining fetcher in each page.
 */
export const swrFetcher: BareFetcher<any> = (url: string) => api.get(url).then((res) => res.data);
