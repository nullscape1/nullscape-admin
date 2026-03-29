import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { swrFetcher } from '../../lib/swrFetcher';
import { useRouter } from 'next/router';
import useSWR from 'swr';

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load categories from API
  const { data: categoriesData } = useSWR('/portfolio-categories?status=active&limit=100', swrFetcher);
  const categories = categoriesData?.items || [];

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const techStack = techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const screenshots = screenshotUrl.trim() ? [screenshotUrl.trim()] : [];
      await api.post('/portfolio', {
        name,
        category,
        description,
        solution: description,
        status,
        ...(screenshots.length ? { screenshots } : {}),
        ...(techStack.length ? { techStack } : {}),
      });
      router.push('/portfolio');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>New Project</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category *</label>
          {categories.length > 0 ? (
            <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ width: '100%' }}>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          ) : (
            <div style={{ padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
              No categories available. Please create a category first in Portfolio Categories.
            </div>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} style={{ width: '100%' }} />
          <p style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
            Plain text or HTML is stored as-is. The public site shows a short plain-text preview on cards.
          </p>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Cover image URL (optional)</label>
          <input
            value={screenshotUrl}
            onChange={(e) => setScreenshotUrl(e.target.value)}
            placeholder="https://…"
            type="url"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Tech stack (optional)</label>
          <input
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            placeholder="React, Node.js, PostgreSQL"
            style={{ width: '100%' }}
          />
          <p style={{ marginTop: 6, fontSize: 13, color: '#666' }}>Comma-separated tags shown on the website.</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <button disabled={loading || categories.length === 0} type="submit" style={{ marginTop: 16 }}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}


