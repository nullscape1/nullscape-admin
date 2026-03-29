import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { normalizeId, getApiErrorMessage } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['App', 'Web', 'AI', 'Other'] as const;

export default function EditTestimonial() {
  const router = useRouter();
  const id = normalizeId(router.query.id);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();

  useEffect(() => {
    if (!router.isReady || !id) return;
    setError('');
    api
      .get(`/testimonials/${id}`)
      .then((r) => setRow(r.data))
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'Failed to load')));
  }, [router.isReady, id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !row) return;
    setLoading(true);
    setError('');
    try {
      const rating = Math.max(1, Math.min(5, Number(row.rating) || 5));
      await api.put(`/testimonials/${id}`, {
        clientName: row.clientName,
        review: row.review,
        rating,
        picture: typeof row.picture === 'string' && row.picture.trim() ? row.picture.trim() : undefined,
        category: row.category,
        status: row.status,
        featured: Boolean(row.featured),
      });
      router.push('/testimonials');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to save'));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!id || !confirm('Delete this testimonial?')) return;
    await api.delete(`/testimonials/${id}`);
    router.push('/testimonials');
  }

  if (!router.isReady || (!row && !error)) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error && !row) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Edit testimonial</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }
  if (!row) return null;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit testimonial</h1>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={onSave} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Client name *</label>
          <input
            value={String(row.clientName ?? '')}
            onChange={(e) => setRow({ ...row, clientName: e.target.value })}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Review *</label>
          <textarea
            value={String(row.review ?? '')}
            onChange={(e) => setRow({ ...row, review: e.target.value })}
            required
            rows={6}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Rating (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={Number(row.rating ?? 5)}
            onChange={(e) => setRow({ ...row, rating: Number(e.target.value) })}
            style={{ width: 120 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Photo URL (optional)</label>
          <input
            value={String(row.picture ?? '')}
            onChange={(e) => setRow({ ...row, picture: e.target.value })}
            type="url"
            placeholder="https://…"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category</label>
          <select
            value={String(row.category ?? 'Web')}
            onChange={(e) => setRow({ ...row, category: e.target.value })}
            style={{ width: '100%' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select
            value={String(row.status ?? 'active')}
            onChange={(e) => setRow({ ...row, status: e.target.value })}
            style={{ width: '100%' }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(row.featured)}
              onChange={(e) => setRow({ ...row, featured: e.target.checked })}
            />
            Featured (show first on website)
          </label>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button disabled={loading} type="submit">
            {loading ? 'Saving…' : 'Save'}
          </button>
          {hasRole('Admin', 'SuperAdmin') && (
            <button type="button" onClick={onDelete} style={{ background: '#eee' }}>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
