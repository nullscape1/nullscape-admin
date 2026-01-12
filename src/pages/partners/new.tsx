import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { addToast } from '../../lib/toast';
import PageHeader from '../../components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPartner() {
  const router = useRouter();
  const { call, loading } = useApi(
    (payload: any) => api.post('/partners', payload),
    { success: 'Partner created', error: 'Failed to create partner' }
  );
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    subtitle: '',
    logoColor: '#005CFF',
    order: 0,
    status: 'active',
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await call(formData);
      router.push('/partners');
    } catch (err: any) {
      // Error is already handled by useApi hook
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/partners" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="New Trusted Partner"
          description="Add a new trusted partner to the website"
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
            placeholder="e.g., DELL, Microsoft, etc."
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
          <p className="text-sm text-muted-foreground mt-1">
            If no logo URL is provided, the partner name will be displayed as text
          </p>
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
          <p className="text-sm text-muted-foreground mt-1">
            Optional subtitle text that appears below the partner name
          </p>
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
          <p className="text-sm text-muted-foreground mt-1">
            Color for text-based logos (when logo URL is not provided)
          </p>
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
            <p className="text-sm text-muted-foreground mt-1">
              Lower numbers appear first
            </p>
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
            {loading ? 'Creating...' : 'Create Partner'}
          </button>
          <Link href="/partners" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

