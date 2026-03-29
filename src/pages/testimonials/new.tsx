import { useState } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/router';

const CATEGORIES = ['App', 'Web', 'AI', 'Other'] as const;

export default function NewTestimonial() {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [picture, setPicture] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Web');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/testimonials', {
        clientName,
        review,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        picture: picture.trim() || undefined,
        category,
        status,
        featured,
      });
      router.push('/testimonials');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      setError(msg || 'Failed to create');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>New testimonial</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <div style={{ marginTop: 12 }}>
          <label>Client name *</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Review *</label>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} required rows={6} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Rating (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ width: 120 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Photo URL (optional)</label>
          <input value={picture} onChange={(e) => setPicture(e.target.value)} type="url" placeholder="https://…" style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])} style={{ width: '100%' }}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} style={{ width: '100%' }}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured (show first on website)
          </label>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ marginTop: 16 }}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
