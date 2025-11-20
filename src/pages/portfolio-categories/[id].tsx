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

export default function EditPortfolioCategory() {
  const router = useRouter();
  const { id } = router.query;
  const { call, loading } = useApi();
  const { data: category, mutate } = useSWR(id ? `/portfolio-categories/${id}` : null, fetcher);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    status: 'active',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
        order: category.order || 0,
        status: category.status || 'active',
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await call(`/portfolio-categories/${id}`, {
        method: 'PUT',
        data: formData,
      });
      addToast('Category updated successfully', 'success');
      mutate();
      router.push('/portfolio-categories');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update category', 'error');
    }
  };

  if (!category && !loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/portfolio-categories" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="Edit Portfolio Category"
          description="Update portfolio category details"
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
            {loading ? 'Updating...' : 'Update Category'}
          </button>
          <Link href="/portfolio-categories" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}


