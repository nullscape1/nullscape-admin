import { useState } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/router';
import { getApiErrorMessage } from '../../lib/utils';

export default function NewTeamMember() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/team', {
        name,
        role,
        image: image.trim() || undefined,
        description: description.trim() || undefined,
        order: Number(order) || 0,
        status,
        social: {
          ...(linkedin.trim() ? { linkedin: linkedin.trim() } : {}),
          ...(twitter.trim() ? { twitter: twitter.trim() } : {}),
          ...(github.trim() ? { github: github.trim() } : {}),
          ...(website.trim() ? { website: website.trim() } : {}),
        },
      });
      router.push('/team');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>New team member</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Role *</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Photo URL (optional)</label>
          <input value={image} onChange={(e) => setImage(e.target.value)} type="url" placeholder="https://…" style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Sort order</label>
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} style={{ width: 120 }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} style={{ width: '100%' }}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <p style={{ marginTop: 16, fontWeight: 600 }}>Social (optional)</p>
        <div style={{ marginTop: 8 }}>
          <label>LinkedIn</label>
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Twitter</label>
          <input value={twitter} onChange={(e) => setTwitter(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>GitHub</label>
          <input value={github} onChange={(e) => setGithub(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Website</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ marginTop: 16 }}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
