import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';

export default function EditCmsPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [page, setPage] = useState<any>(null);
  const [sectionsText, setSectionsText] = useState<string>('[]');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/cms/pages/${id}`).then((r) => {
      setPage(r.data);
      setSectionsText(JSON.stringify(r.data.sections || [], null, 2));
    }).catch(() => setError('Failed to load'));
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
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

  if (!page) return <div style={{ padding: 24 }}>Loading...</div>;

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


