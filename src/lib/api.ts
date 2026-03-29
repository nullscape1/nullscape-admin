import axios from 'axios';
import Cookies from 'js-cookie';

const COOKIE_OPTS = { path: '/', sameSite: 'lax' as const };

function isLocalDevHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return false;
}

function publicApiUrlIsLocalHost(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Resolve API base URL. Browser prefers same-origin /api/proxy (Pages API route) so login
 * never depends on CORS or calling :4000 from the browser.
 */
export function getApiBaseURL(): string {
  const explicit = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  if (typeof window !== 'undefined') {
    const skipProxy =
      process.env.NEXT_PUBLIC_USE_DEV_PROXY === '0' ||
      process.env.NEXT_PUBLIC_USE_DEV_PROXY === 'false';

    if (!skipProxy) {
      const useProxy =
        process.env.NODE_ENV === 'development' ||
        !explicit ||
        publicApiUrlIsLocalHost(explicit);
      if (useProxy) {
        return '/api/proxy';
      }
    }

    if (explicit) {
      return explicit;
    }

    const host = window.location.hostname;
    if (!isLocalDevHost(host)) {
      const fallback =
        (process.env.NEXT_PUBLIC_API_URL || '').trim() ||
        'https://nullscape-backend.onrender.com/api/v1';
      return fallback.replace(/\/$/, '');
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000/api/v1';
    }
    return `http://${host}:4000/api/v1`;
  }

  // Server-side (SSR / API routes): call backend directly
  if (process.env.NODE_ENV === 'development' || publicApiUrlIsLocalHost(explicit)) {
    return process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000/api/v1';
  }
  if (explicit) {
    return explicit;
  }
  return 'http://127.0.0.1:4000/api/v1';
}

export const api = axios.create({
  baseURL: typeof window === 'undefined' ? getApiBaseURL() : '/api/proxy',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 60_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-param-reassign
    config.baseURL = getApiBaseURL();
  }
  const token = Cookies.get('accessToken');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('accessToken', COOKIE_OPTS);
      Cookies.remove('refreshToken', COOKIE_OPTS);
    }
    return Promise.reject(err);
  }
);

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  Cookies.set('accessToken', data.tokens.accessToken, COOKIE_OPTS);
  Cookies.set('refreshToken', data.tokens.refreshToken, COOKIE_OPTS);
  return data.user;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function logout() {
  const refreshToken = Cookies.get('refreshToken');
  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    Cookies.remove('accessToken', COOKIE_OPTS);
    Cookies.remove('refreshToken', COOKIE_OPTS);
  }
}
