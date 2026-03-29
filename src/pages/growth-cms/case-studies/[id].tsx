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

type CaseStudy = {
  _id: string;
  title: string;
  slug?: string;
  industry?: string;
  summary?: string;
  featuredImage?: string;
  content?: {
    clientDomain?: string;
    opportunity?: string;
    solution?: string;
    result?: string;
  };
  status?: string;
};

export default function EditCaseStudyCms() {
  const router = useRouter();
  const id = normalizeId(router.query.id);
  const { data: row, mutate } = useSWR<CaseStudy>(id ? `/cms-v2/case-studies/${id}` : null, swrFetcher);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState('');
  const [summary, setSummary] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [clientDomain, setClientDomain] = useState('');
  const [opportunity, setOpportunity] = useState('');
  const [solution, setSolution] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    if (!row) return;
    setTitle(row.title || '');
    setSlug(row.slug || '');
    setIndustry(row.industry || '');
    setSummary(row.summary || '');
    setFeaturedImage(row.featuredImage || '');
    const c = row.content || {};
    setClientDomain(c.clientDomain || '');
    setOpportunity(c.opportunity || '');
    setSolution(c.solution || '');
    setResult(c.result || '');
    setStatus((row.status === 'published' ? 'published' : 'draft') as 'draft' | 'published');
  }, [row]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await api.put(`/cms-v2/case-studies/${id}`, {
        title,
        slug: slug || undefined,
        industry,
        summary,
        featuredImage,
        content: {
          clientDomain,
          opportunity,
          solution,
          result,
        },
        status,
      });
      addToast('Case study updated', 'success');
      mutate();
      router.push('/growth-cms/case-studies');
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
        <Link href="/growth-cms/case-studies" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader title="Edit case study" description="Homepage card shows title, summary, domain, and industry." />
      </div>

      <form onSubmit={handleSubmit} className="card card-padding space-y-6 max-w-3xl">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input id="title" className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="slug">Slug</label>
          <input id="slug" className="input" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="industry">Industry</label>
            <input id="industry" className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="featuredImage">Featured image URL</label>
            <input id="featuredImage" type="url" className="input" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="summary">Summary (card)</label>
          <textarea id="summary" className="input" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="clientDomain">Client domain (label)</label>
          <input id="clientDomain" className="input" value={clientDomain} onChange={(e) => setClientDomain(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="opportunity">Opportunity</label>
          <textarea id="opportunity" className="input" rows={3} value={opportunity} onChange={(e) => setOpportunity(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="solution">Solution</label>
          <textarea id="solution" className="input" rows={3} value={solution} onChange={(e) => setSolution(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="result">Result</label>
          <textarea id="result" className="input" rows={3} value={result} onChange={(e) => setResult(e.target.value)} />
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
          <Link href="/growth-cms/case-studies" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
