import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function NewBlogPost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load categories from API
  const { data: categoriesData } = useSWR('/blog-categories?status=active&limit=100', fetcher);
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
      await api.post('/blog', { title, description, contentHtml, category, status });
      router.push('/blog');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>New Blog Post</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category</label>
          {categories.length > 0 ? (
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
              <option value="">No Category</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          ) : (
            <div style={{ padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
              No categories available. Create one in Blog Categories (optional).
            </div>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Content (HTML)</label>
          <textarea value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={10} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ marginTop: 16 }}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}


