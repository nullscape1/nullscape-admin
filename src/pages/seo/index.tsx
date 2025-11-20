import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Save, ExternalLink, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { addToast } from '../../lib/toast';

export default function SeoSettingsPage() {
  const { hasRole } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [robotsTxt, setRobotsTxt] = useState<string>('User-agent: *\nAllow: /\nSitemap: /sitemap.xml');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    api.get('/cms/seo').then((r) => {
      const found = r.data?.items?.[0];
      setItem(found);
      if (found?.robotsTxt) setRobotsTxt(found.robotsTxt);
    }).catch(() => {}).finally(() => {
      setPageLoading(false);
    });
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);
    try {
      if (item?._id) {
        await api.put(`/cms/seo/${item._id}`, { ...item, robotsTxt });
      } else {
        const { data } = await api.post('/cms/seo', { robotsTxt });
        setItem(data);
      }
      setSaved(true);
      addToast('SEO settings saved successfully', 'success');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save');
      addToast('Failed to save SEO settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  const baseUrl = (api.defaults.baseURL as string).replace('/api/v1', '');
  const robotsUrl = `${baseUrl}/api/v1/robots.txt`;
  const sitemapUrl = `${baseUrl}/api/v1/sitemap.xml`;

  if (pageLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card card-padding">
          <div className="skeleton h-8 w-64 mb-4" />
          <div className="skeleton h-4 w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="SEO Settings"
        description="Manage your website's SEO configuration and robots.txt"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card card-padding"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Public Files</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Public:</span>
            <a
              href={robotsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              robots.txt
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <a
              href={sitemapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              sitemap.xml
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-6">
          <div>
            <label htmlFor="robotsTxt" className="block text-sm font-semibold mb-3">
              robots.txt
            </label>
            <textarea
              id="robotsTxt"
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              rows={12}
              className="input w-full font-mono text-sm resize-none"
              placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: /sitemap.xml"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Configure how search engines crawl your website
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {saved && (
            <div className="p-4 rounded-xl bg-green-500/10 border-2 border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium">
              Settings saved successfully!
            </div>
          )}

          {hasRole('Admin', 'SuperAdmin') && (
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
