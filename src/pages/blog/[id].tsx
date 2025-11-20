import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function EditBlogPost() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();
  
  // Load categories from API
  const { data: categoriesData } = useSWR('/blog-categories?status=active&limit=100', fetcher);
  const categories = categoriesData?.items || [];

  useEffect(() => {
    if (!id) return;
    api.get(`/blog/${id}`).then((r) => setPost(r.data)).catch(() => setError('Failed to load'));
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/blog/${id}`, { title: post.title, description: post.description, contentHtml: post.contentHtml, category: post.category, status: post.status });
      router.push('/blog');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/blog/${id}`);
    router.push('/blog');
  }

  if (!post) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit Blog Post</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={onSave} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Title</label>
          <input value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description</label>
          <input value={post.description || ''} onChange={(e) => setPost({ ...post, description: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category</label>
          {categories.length > 0 ? (
            <select value={post.category || ''} onChange={(e) => setPost({ ...post, category: e.target.value })} style={{ width: '100%' }}>
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
          <textarea value={post.contentHtml || ''} onChange={(e) => setPost({ ...post, contentHtml: e.target.value })} rows={10} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={post.status} onChange={(e) => setPost({ ...post, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button disabled={loading} type="submit">{loading ? 'Saving...' : 'Save'}</button>
          {hasRole('Admin', 'SuperAdmin') && <button onClick={onDelete} type="button" style={{ background: '#eee' }}>Delete</button>}
        </div>
      </form>
    </div>
  );
}


