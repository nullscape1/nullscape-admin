import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import { api } from '../../../lib/api';
import { swrFetcher } from '../../../lib/swrFetcher';
import { normalizeId } from '../../../lib/utils';
import { addToast } from '../../../lib/toast';
import PageHeader from '../../../components/PageHeader';

type Industry = {
  _id: string;
  name: string;
  slug?: string;
  category?: string;
  content?: { summary?: string };
  status?: string;
};

export default function EditIndustryCms() {
  const router = useRouter();
  const id = normalizeId(router.query.id);
  const { data: row, mutate } = useSWR<Industry>(id ? `/cms-v2/industries/${id}` : null, swrFetcher);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    if (!row) return;
    setName(row.name || '');
    setSlug(row.slug || '');
    setCategory(row.category || '');
    setSummary((row.content && row.content.summary) || '');
    setStatus((row.status === 'published' ? 'published' : 'draft') as 'draft' | 'published');
  }, [row]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await api.put(`/cms-v2/industries/${id}`, {
        name,
        slug: slug || undefined,
        category,
        content: { summary },
        status,
      });
      addToast('Industry updated', 'success');
      mutate();
      router.push('/growth-cms/industries');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : null;
      addToast(msg || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!row && id) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/growth-cms/industries" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader title="Edit industry" description="Published rows sync to the marketing site on next load or refresh." />
      </div>

      <form onSubmit={handleSubmit} className="card card-padding space-y-6 max-w-2xl">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="slug">Slug</label>
          <input id="slug" className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name if empty" />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category / tag</label>
          <input id="category" className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" className="input" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
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
            {loading ? 'Saving…' : 'Save'}
          </button>
          <Link href="/growth-cms/industries" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
