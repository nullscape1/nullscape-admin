import { useState } from 'react';
import { api } from '../../lib/api';
import { swrFetcher } from '../../lib/swrFetcher';
import { useRouter } from 'next/router';
import useSWR from 'swr';

function parseTagsInput(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function NewBlogPost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [category, setCategory] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: categoriesData } = useSWR('/blog-categories?status=active&limit=100', swrFetcher);
  const categories = categoriesData?.items || [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/blog', {
        title,
        description,
        contentHtml,
        thumbnail: thumbnail || undefined,
        tags: parseTagsInput(tagsInput),
        category: category || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        status,
      });
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
          <label>Thumbnail URL</label>
          <input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} style={{ width: '100%' }} placeholder="https://..." />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Tags (comma-separated)</label>
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} style={{ width: '100%' }} placeholder="react, node" />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category</label>
          {categories.length > 0 ? (
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
              <option value="">No Category</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
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
          <textarea value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={12} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>SEO title</label>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>SEO description</label>
          <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
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
