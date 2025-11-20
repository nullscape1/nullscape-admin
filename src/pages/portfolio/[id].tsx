import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function EditProject() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();
  
  // Load categories from API
  const { data: categoriesData } = useSWR('/portfolio-categories?status=active&limit=100', fetcher);
  const categories = categoriesData?.items || [];

  useEffect(() => {
    if (!id) return;
    api.get(`/portfolio/${id}`).then((r) => setProject(r.data)).catch(() => setError('Failed to load'));
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/portfolio/${id}`, { name: project.name, category: project.category, solution: project.solution, status: project.status });
      router.push('/portfolio');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/portfolio/${id}`);
    router.push('/portfolio');
  }

  if (!project) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit Project</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={onSave} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Name</label>
          <input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category *</label>
          {categories.length > 0 ? (
            <select value={project.category || ''} onChange={(e) => setProject({ ...project, category: e.target.value })} required style={{ width: '100%' }}>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          ) : (
            <div style={{ padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
              No categories available. Please create a category first.
            </div>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description</label>
          <textarea value={project.solution || ''} onChange={(e) => setProject({ ...project, solution: e.target.value })} rows={6} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={project.status} onChange={(e) => setProject({ ...project, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button disabled={loading || categories.length === 0} type="submit">{loading ? 'Saving...' : 'Save'}</button>
          {hasRole('Admin', 'SuperAdmin') && <button onClick={onDelete} type="button" style={{ background: '#eee' }}>Delete</button>}
        </div>
      </form>
    </div>
  );
}


