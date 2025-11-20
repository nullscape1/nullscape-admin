import { useState } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '../../lib/useApi';
import { addToast } from '../../lib/toast';
import PageHeader from '../../components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPortfolioCategory() {
  const router = useRouter();
  const { call, loading } = useApi();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await call('/portfolio-categories', {
        method: 'POST',
        data: formData,
      });
      addToast('Category created successfully', 'success');
      router.push('/portfolio-categories');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to create category', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/portfolio-categories" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="New Portfolio Category"
          description="Create a new portfolio category"
        />
      </div>

      <form onSubmit={handleSubmit} className="card card-padding space-y-6">
        <div className="form-group">
          <label htmlFor="name">Category Name *</label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="e.g., Web Development"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={3}
            placeholder="Category description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="icon">Icon URL</label>
          <input
            id="icon"
            type="url"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="input"
            placeholder="https://example.com/icon.png"
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
            {loading ? 'Creating...' : 'Create Category'}
          </button>
          <Link href="/portfolio-categories" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}


