import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';
import { addToast } from '../../../lib/toast';
import PageHeader from '../../../components/PageHeader';

export default function NewIndustryCms() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/cms-v2/industries', {
        name,
        category,
        content: { summary },
        status,
      });
      addToast('Industry created', 'success');
      router.push('/growth-cms/industries');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : null;
      addToast(msg || 'Failed to create', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/growth-cms/industries" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader title="New industry" description="Shown on the homepage industries grid when status is published." />
      </div>

      <form onSubmit={handleSubmit} className="card card-padding space-y-6 max-w-2xl">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FinTech" />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category / tag</label>
          <input id="category" className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Optional label" />
        </div>
        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" className="input" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short paragraph for the card" />
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Create'}
          </button>
          <Link href="/growth-cms/industries" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
