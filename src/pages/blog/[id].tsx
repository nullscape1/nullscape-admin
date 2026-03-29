import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { swrFetcher } from '../../lib/swrFetcher';
import { normalizeId, getApiErrorMessage } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import useSWR from 'swr';

function tagsToInput(tags: unknown): string {
  if (!Array.isArray(tags)) return '';
  return tags.map((t) => String(t)).join(', ');
}

function parseTagsInput(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function EditBlogPost() {
  const router = useRouter();
  const id = normalizeId(router.query.id);
  const [post, setPost] = useState<any>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();

  const { data: categoriesData } = useSWR('/blog-categories?status=active&limit=100', swrFetcher);
  const categories = categoriesData?.items || [];

  useEffect(() => {
    if (!router.isReady || !id) return;
    setError('');
    api
      .get(`/blog/${id}`)
      .then((r) => {
        setPost(r.data);
        setTagsInput(tagsToInput(r.data?.tags));
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
      await api.put(`/blog/${id}`, {
        title: post.title,
        description: post.description,
        contentHtml: post.contentHtml,
        thumbnail: post.thumbnail || '',
        tags: parseTagsInput(tagsInput),
        category: post.category || '',
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
        status: post.status,
      });
      router.push('/blog');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to save'));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/blog/${id}`);
    router.push('/blog');
  }

  if (!router.isReady || (!post && !error)) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error && !post)
    return (
      <div style={{ padding: 24 }}>
        <h1>Edit Blog Post</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit Blog Post</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={onSave} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Title</label>
          <input
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Description</label>
          <input
            value={post.description || ''}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Thumbnail URL</label>
          <input
            value={post.thumbnail || ''}
            onChange={(e) => setPost({ ...post, thumbnail: e.target.value })}
            style={{ width: '100%' }}
            placeholder="https://..."
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Tags (comma-separated)</label>
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} style={{ width: '100%' }} placeholder="react, node, tutorial" />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category</label>
          {categories.length > 0 ? (
            <select
              value={post.category || ''}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
              style={{ width: '100%' }}
            >
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
          <textarea
            value={post.contentHtml || ''}
            onChange={(e) => setPost({ ...post, contentHtml: e.target.value })}
            rows={12}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>SEO title</label>
          <input
            value={post.seoTitle || ''}
            onChange={(e) => setPost({ ...post, seoTitle: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>SEO description</label>
          <textarea
            value={post.seoDescription || ''}
            onChange={(e) => setPost({ ...post, seoDescription: e.target.value })}
            rows={2}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={post.status} onChange={(e) => setPost({ ...post, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button disabled={loading} type="submit">
            {loading ? 'Saving...' : 'Save'}
          </button>
          {hasRole('Admin', 'SuperAdmin') && (
            <button onClick={onDelete} type="button" style={{ background: '#eee' }}>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
