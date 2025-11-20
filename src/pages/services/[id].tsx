import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';

export default function EditService() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [service, setService] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/services/${id}`).then((r) => setService(r.data)).catch(() => setError('Failed to load'));
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.put(`/services/${id}`, { name: service.name, description: service.description, status: service.status });
      router.push('/services');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save');
    }
  }

  async function onDelete() {
    if (!confirm('Delete service?')) return;
    await api.delete(`/services/${id}`);
    router.push('/services');
  }

  if (!service) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit Service</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={onSave} style={{ maxWidth: 560 }}>
        <div style={{ marginTop: 12 }}>
          <label>Name</label>
          <input value={service.name} onChange={(e) => setService({ ...service, name: e.target.value })} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description</label>
          <textarea value={service.description || ''} onChange={(e) => setService({ ...service, description: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={service.status} onChange={(e) => setService({ ...service, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button type="submit">Save</button>
          <button onClick={onDelete} type="button" style={{ background: '#eee' }}>Delete</button>
        </div>
      </form>
    </div>
  );
}



