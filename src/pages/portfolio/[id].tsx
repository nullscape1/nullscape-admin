import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { swrFetcher } from '../../lib/swrFetcher';
import { normalizeId, getApiErrorMessage } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import useSWR from 'swr';

export default function EditProject() {
  const router = useRouter();
  const id = normalizeId(router.query.id);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();
  
  // Load categories from API
  const { data: categoriesData } = useSWR<{ items: unknown[] }>('/portfolio-categories?status=active&limit=100', swrFetcher);
  const categories = categoriesData?.items || [];

  useEffect(() => {
    if (!router.isReady || !id) return;
    setError('');
    api
      .get(`/portfolio/${id}`)
      .then((r) => {
        const d = r.data;
        const screenshotUrl = Array.isArray(d.screenshots) && d.screenshots[0] ? String(d.screenshots[0]) : '';
        const techStackInput = Array.isArray(d.techStack) ? d.techStack.join(', ') : '';
        setProject({ ...d, screenshotUrl, techStackInput });
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'Failed to load')));
  }, [router.isReady, id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) {
      setError('Page not ready. Please wait and try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const body = project.description ?? project.solution ?? '';
      const techRaw = typeof project.techStackInput === 'string' ? project.techStackInput : '';
      const techStack = techRaw
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const shot = (project.screenshotUrl || '').trim();
      const screenshots = shot ? [shot] : [];
      await api.put(`/portfolio/${id}`, {
        name: project.name,
        category: project.category,
        description: body,
        solution: body,
        status: project.status,
        screenshots,
        techStack,
      });
      router.push('/portfolio');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to save'));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/portfolio/${id}`);
    router.push('/portfolio');
  }

  if (!router.isReady || (!project && !error)) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error && !project) return <div style={{ padding: 24 }}><h1>Edit Project</h1><p style={{ color: 'red' }}>{error}</p></div>;

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
          <textarea
            value={project.description ?? project.solution ?? ''}
            onChange={(e) =>
              setProject({ ...project, description: e.target.value, solution: e.target.value })
            }
            rows={6}
            style={{ width: '100%' }}
          />
          <p style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
            Plain text or HTML. The website shows a short plain-text preview on cards.
          </p>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Cover image URL (optional)</label>
          <input
            value={project.screenshotUrl || ''}
            onChange={(e) => setProject({ ...project, screenshotUrl: e.target.value })}
            placeholder="https://…"
            type="url"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Tech stack (optional)</label>
          <input
            value={project.techStackInput || ''}
            onChange={(e) => setProject({ ...project, techStackInput: e.target.value })}
            placeholder="React, Node.js"
            style={{ width: '100%' }}
          />
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


