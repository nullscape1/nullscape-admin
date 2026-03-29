import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { normalizeId, getApiErrorMessage } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function EditTeamMember() {
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
      .get(`/team/${id}`)
      .then((r) => setRow(r.data))
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'Failed to load')));
  }, [router.isReady, id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !row) return;
    setLoading(true);
    setError('');
    try {
      const social = (row.social && typeof row.social === 'object' ? row.social : {}) as Record<string, string>;
      await api.put(`/team/${id}`, {
        name: row.name,
        role: row.role,
        image: typeof row.image === 'string' && row.image.trim() ? row.image.trim() : undefined,
        description: typeof row.description === 'string' ? row.description : undefined,
        order: Number(row.order) || 0,
        status: row.status,
        social: {
          ...(social.linkedin ? { linkedin: social.linkedin } : {}),
          ...(social.twitter ? { twitter: social.twitter } : {}),
          ...(social.github ? { github: social.github } : {}),
          ...(social.website ? { website: social.website } : {}),
        },
      });
      router.push('/team');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to save'));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!id || !confirm('Delete this team member?')) return;
    await api.delete(`/team/${id}`);
    router.push('/team');
  }

  if (!router.isReady || (!row && !error)) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error && !row) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Edit team member</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }
  if (!row) return null;

  const social = (row.social && typeof row.social === 'object' ? row.social : {}) as Record<string, string>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit team member</h1>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={onSave} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Name *</label>
          <input
            value={String(row.name ?? '')}
            onChange={(e) => setRow({ ...row, name: e.target.value })}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Role *</label>
          <input
            value={String(row.role ?? '')}
            onChange={(e) => setRow({ ...row, role: e.target.value })}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Photo URL (optional)</label>
          <input
            value={String(row.image ?? '')}
            onChange={(e) => setRow({ ...row, image: e.target.value })}
            type="url"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description</label>
          <textarea
            value={String(row.description ?? '')}
            onChange={(e) => setRow({ ...row, description: e.target.value })}
            rows={4}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Sort order</label>
          <input
            type="number"
            value={Number(row.order ?? 0)}
            onChange={(e) => setRow({ ...row, order: Number(e.target.value) })}
            style={{ width: 120 }}
          />
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
        <p style={{ marginTop: 16, fontWeight: 600 }}>Social (optional)</p>
        <div style={{ marginTop: 8 }}>
          <label>LinkedIn</label>
          <input
            value={social.linkedin || ''}
            onChange={(e) => setRow({ ...row, social: { ...social, linkedin: e.target.value } })}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Twitter</label>
          <input
            value={social.twitter || ''}
            onChange={(e) => setRow({ ...row, social: { ...social, twitter: e.target.value } })}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>GitHub</label>
          <input
            value={social.github || ''}
            onChange={(e) => setRow({ ...row, social: { ...social, github: e.target.value } })}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Website</label>
          <input
            value={social.website || ''}
            onChange={(e) => setRow({ ...row, social: { ...social, website: e.target.value } })}
            style={{ width: '100%' }}
          />
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
