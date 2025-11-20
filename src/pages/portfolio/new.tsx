import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load categories from API
  const { data: categoriesData } = useSWR('/portfolio-categories?status=active&limit=100', fetcher);
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
      await api.post('/portfolio', { name, category, solution: description, status });
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


