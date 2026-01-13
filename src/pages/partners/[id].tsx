import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '../../lib/useApi';
import { addToast } from '../../lib/toast';
import PageHeader from '../../components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { api } from '../../lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function EditPartner() {
  const router = useRouter();
  const { id } = router.query;
  const { call, loading } = useApi(
    (payload: any) => api.put(`/partners/${id}`, payload),
    { success: 'Partner updated', error: 'Failed to update partner' }
  );
  const { data: partner, mutate } = useSWR(id ? `/partners/${id}` : null, fetcher);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    subtitle: '',
    logoColor: '#005CFF',
    order: 0,
    status: 'active',
    website: '',
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        logo: partner.logo || '',
        subtitle: partner.subtitle || '',
        logoColor: partner.logoColor || '#005CFF',
        order: partner.order || 0,
        status: partner.status || 'active',
        website: partner.website || '',
      });
    }
  }, [partner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await call(formData);
      mutate();
      router.push('/partners');
    } catch (err: any) {
      // Error is already handled by useApi hook
    }
  };

  if (!partner && !loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/partners" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="Edit Trusted Partner"
          description="Update partner information"
        />
      </div>

      <form onSubmit={handleSubmit} className="card card-padding space-y-6">
        <div className="form-group">
          <label htmlFor="name">Partner Name *</label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="logo">Logo URL</label>
          <input
            id="logo"
            type="url"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="input"
            placeholder="https://example.com/logo.png"
          />
          {formData.logo && (
            <div className="mt-2">
              <img 
                src={formData.logo} 
                alt="Logo preview" 
                className="w-24 h-24 object-contain border rounded p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="subtitle">Subtitle</label>
          <input
            id="subtitle"
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="input"
            placeholder="e.g., Enterprise, Kotak Mahindra Bank, etc."
          />
        </div>

        <div className="form-group">
          <label htmlFor="logoColor">Logo Color</label>
          <div className="flex items-center gap-3">
            <input
              id="logoColor"
              type="color"
              value={formData.logoColor}
              onChange={(e) => setFormData({ ...formData, logoColor: e.target.value })}
              className="w-16 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.logoColor}
              onChange={(e) => setFormData({ ...formData, logoColor: e.target.value })}
              className="input flex-1"
              placeholder="#005CFF"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="website">Website URL</label>
          <input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="input"
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="order">Display Order</label>
            <input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Partner'}
          </button>
          <Link href="/partners" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}



