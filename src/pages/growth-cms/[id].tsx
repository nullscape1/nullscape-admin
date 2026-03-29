import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { normalizeId } from '../../lib/utils';

type SectionRow = {
  _id?: string;
  type: string;
  name?: string;
  order: number;
  status: 'draft' | 'published';
  content: unknown;
};

export default function GrowthCmsEditor() {
  const router = useRouter();
  const id = normalizeId(router.query.id);
  const [page, setPage] = useState<Record<string, unknown> | null>(null);
  const [sectionsDraft, setSectionsDraft] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const persistedSectionIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!router.isReady || !id) return;
    setError('');
    Promise.all([api.get(`/cms-v2/pages/${id}`), api.get(`/cms-v2/pages/${id}/sections`)])
      .then(([pageRes, sectionRes]) => {
        setPage(pageRes.data);
        const mapped = (sectionRes.data?.items || []).map((s: Record<string, unknown>, idx: number) => ({
          ...s,
          order: s.order ?? idx,
        })) as SectionRow[];
        setSectionsDraft(JSON.stringify(mapped, null, 2));
        persistedSectionIdsRef.current = new Set(
          mapped.filter((s) => s._id).map((s) => String(s._id))
        );
      })
      .catch((err: { response?: { data?: { message?: string } } }) =>
        setError(err?.response?.data?.message || 'Failed to load page')
      );
  }, [router.isReady, id]);

  async function savePage() {
    if (!id || !page) return;
    let parsed: SectionRow[];
    try {
      parsed = JSON.parse(sectionsDraft) as SectionRow[];
      if (!Array.isArray(parsed)) throw new Error('Sections must be an array');
    } catch {
      setError('Invalid sections JSON. Expected an array of section objects.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.put(`/cms-v2/pages/${id}`, {
        title: page.title,
        slug: page.slug,
        status: page.status,
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
      });

      const newIds = new Set(parsed.filter((s) => s._id).map((s) => String(s._id)));
      const removed = [...persistedSectionIdsRef.current].filter((sid) => !newIds.has(sid));
      await Promise.all(removed.map((sid) => api.delete(`/cms-v2/sections/${sid}`)));

      const existing = parsed.filter((s) => s._id);
      const fresh = parsed.filter((s) => !s._id);
      await Promise.all(
        existing.map((s) =>
          api.put(`/cms-v2/sections/${s._id}`, {
            pageId: id,
            type: s.type,
            name: s.name || '',
            order: s.order,
            status: s.status,
            content: s.content || {},
          })
        )
      );
      await Promise.all(
        fresh.map((s) =>
          api.post('/cms-v2/sections', {
            pageId: id,
            type: s.type,
            name: s.name || '',
            order: s.order,
            status: s.status,
            content: s.content || {},
          })
        )
      );

      persistedSectionIdsRef.current = newIds;
      router.push('/growth-cms/pages');
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(anyErr?.response?.data?.message || anyErr?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function validateJsonOnBlur() {
    try {
      const parsed = JSON.parse(sectionsDraft);
      if (!Array.isArray(parsed)) throw new Error('not array');
      setError('');
    } catch {
      setError('Invalid sections JSON. Expected an array of section objects.');
    }
  }

  if (!router.isReady || (!page && !error)) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Growth CMS Page Builder</h1>
      <p style={{ marginTop: 8, color: '#6b7280' }}>
        Build pages by ordering dynamic sections and editing section JSON. This content syncs with the public site via{' '}
        <code>GET /page/:slug</code> (see Growth CMS in docs).
      </p>
      {error && <p style={{ color: '#dc2626', marginTop: 12 }}>{error}</p>}
      {page && (
        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          <input
            className="input"
            value={String(page.title || '')}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            placeholder="Page title"
          />
          <input
            className="input"
            value={String(page.slug || '')}
            onChange={(e) => setPage({ ...page, slug: e.target.value })}
            placeholder="slug (e.g. home — must match website data-cms-slug)"
          />
          <select
            className="input"
            value={String(page.status || 'draft')}
            onChange={(e) => setPage({ ...page, status: e.target.value })}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
          <input
            className="input"
            value={String(page.seoTitle || '')}
            onChange={(e) => setPage({ ...page, seoTitle: e.target.value })}
            placeholder="SEO title"
          />
          <textarea
            className="input"
            value={String(page.seoDescription || '')}
            onChange={(e) => setPage({ ...page, seoDescription: e.target.value })}
            placeholder="SEO description"
            rows={3}
          />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Sections JSON</label>
          <textarea
            className="input"
            style={{ fontFamily: 'monospace', minHeight: 380 }}
            value={sectionsDraft}
            onChange={(e) => setSectionsDraft(e.target.value)}
            onBlur={validateJsonOnBlur}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="button" onClick={savePage} disabled={saving}>
              {saving ? 'Saving...' : 'Save page + sections'}
            </button>
            <button className="btn btn-outline" type="button" onClick={() => router.push('/growth-cms/pages')}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
