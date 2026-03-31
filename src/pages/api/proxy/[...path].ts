import type { NextApiRequest, NextApiResponse } from 'next';
import { assertSafeProxySubpath } from '../../../lib/proxyPath';

/**
 * Server-side proxy: browser → same-origin /api/proxy/* → backend /api/v1/*.
 * Avoids browser CORS and fixes "Network Error" when calling localhost:4000 from the admin UI.
 *
 * Configure backend origin (no /api/v1 suffix):
 *   API_PROXY_TARGET=http://127.0.0.1:4000
 */
export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};

function getBackendBase(): string {
  let raw = process.env.API_PROXY_TARGET || process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000';
  raw = raw.replace(/\/$/, '');
  if (/\/api\/v1$/i.test(raw)) {
    raw = raw.replace(/\/api\/v1$/i, '');
  }
  return raw;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prevent Vercel / browser caching of proxied API responses.
  // This ensures admin UI reflects backend changes immediately.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  const segments = req.query.path;
  const pathParts = Array.isArray(segments) ? segments : segments ? [segments] : [];
  const joined = pathParts.join('/');
  const subpath = assertSafeProxySubpath(joined);
  if (!subpath) {
    res.status(400).json({ code: 400, message: 'Invalid or missing API path' });
    return;
  }

  const base = getBackendBase();
  const host = (req.headers.host as string) || 'localhost';
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
  const urlObj = new URL(req.url || '/', `${proto}://${host}`);
  const search = urlObj.search || '';
  const targetUrl = `${base}/api/v1/${subpath}${search}`;

  const headers: Record<string, string> = {};
  const ct = req.headers['content-type'];
  if (ct) headers['Content-Type'] = ct as string;
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization as string;
  }

  const method = (req.method || 'GET').toUpperCase();

  try {
    const init: RequestInit = {
      method,
      headers,
      redirect: 'manual',
    };

    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      if (req.body !== undefined && req.body !== null) {
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const upstream = await fetch(targetUrl, init);
    const text = await upstream.text();
    const upstreamCt = upstream.headers.get('content-type');
    if (upstreamCt) {
      res.setHeader('Content-Type', upstreamCt);
    }
    const total = upstream.headers.get('x-total-count');
    if (total) {
      res.setHeader('X-Total-Count', total);
    }
    res.status(upstream.status).send(text);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Upstream fetch failed';
    res.status(502).json({
      code: 502,
      message: `Cannot reach backend at ${base}. Start nullscape-backend (npm run dev, port 4000) or set API_PROXY_TARGET in nullscape-admin/.env.local.`,
      error: msg,
    });
  }
}
