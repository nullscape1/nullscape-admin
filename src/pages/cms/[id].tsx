import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { normalizeId } from '../../lib/utils';

export default function EditCmsPage() {
  const router = useRouter();
  const id = normalizeId(router.query.id);
  const [page, setPage] = useState<any>(null);
  const [sectionsText, setSectionsText] = useState<string>('[]');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady || !id) return;
    setError('');
    api.get(`/cms/pages/${id}`).then((r) => {
      setPage(r.data);
      setSectionsText(JSON.stringify(r.data.sections || [], null, 2));
    }).catch((err: any) => setError(err?.response?.data?.message || 'Failed to load'));
  }, [router.isReady, id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) {
      setError('Page not ready. Please wait and try again.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let sections: any[] = [];
      try {
        sections = JSON.parse(sectionsText);
        if (!Array.isArray(sections)) throw new Error('Sections must be an array');
      } catch (e: any) {
        throw new Error('Invalid JSON in sections');
      }
      await api.put(`/cms/pages/${id}`, { page: page.page, sections });
      router.push('/cms/pages');
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  if (!router.isReady || (!page && !error)) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error && !page) return <div style={{ padding: 24 }}><h1>Edit CMS Page</h1><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit CMS Page: {page.page}</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={onSave} style={{ maxWidth: 880 }}>
        <div style={{ marginTop: 12 }}>
          <label>Sections JSON (array of {`{ key, content }`})</label>
          <textarea value={sectionsText} onChange={(e) => setSectionsText(e.target.value)} rows={18} style={{ width: '100%', fontFamily: 'monospace' }} />
        </div>
        <button disabled={loading} type="submit" style={{ marginTop: 16 }}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}


