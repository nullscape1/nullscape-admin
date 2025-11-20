import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { addToast } from '../../lib/toast';
import PageHeader from '../../components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBlogCategory() {
  const router = useRouter();
  const { call, loading } = useApi(
    (payload: any) => api.post('/blog-categories', payload),
    { success: 'Category created', error: 'Failed to create category' }
  );
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#005CFF',
    order: 0,
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await call(formData);
      router.push('/blog-categories');
    } catch (err: any) {
      // Error is already handled by useApi hook
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/blog-categories" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="New Blog Category"
          description="Create a new blog category"
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
            placeholder="e.g., Technology, Business, Design"
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

        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="flex gap-2">
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="input h-10 w-20 p-1"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="input flex-1"
                placeholder="#005CFF"
              />
            </div>
          </div>

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
          <Link href="/blog-categories" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}


