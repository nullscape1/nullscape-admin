import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normalize Next.js router.query id (string | string[] | undefined) to a single string. */
export function normalizeId(queryId: string | string[] | undefined): string | undefined {
  if (queryId == null) return undefined;
  return Array.isArray(queryId) ? queryId[0] : queryId;
}

/** Build a JSON payload with only defined, non-undefined values (so backend gets clean data). */
export function cleanPayload<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/** Get user-facing error message from an API error (axios or similar). */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const anyErr = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
  if (anyErr?.response?.data?.message) return String(anyErr.response.data.message);
  if (anyErr?.response?.status === 401) return 'Session expired. Please log in again.';
  if (anyErr?.response?.status === 403) return 'You do not have permission.';
  if (anyErr?.response?.status === 404) return 'Not found.';
  if (anyErr?.message) return String(anyErr.message);
  return fallback;
}


