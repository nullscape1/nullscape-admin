import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addToast } from '../../lib/toast';
import PageHeader from '../../components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { api } from '../../lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function EditBlogCategory() {
  const router = useRouter();
  const { id } = router.query;
  const { data: category, mutate } = useSWR(id ? `/blog-categories/${id}` : null, fetcher);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#005CFF',
    order: 0,
    status: 'active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        color: category.color || '#005CFF',
        order: category.order || 0,
        status: category.status || 'active',
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setError('');
    setLoading(true);
    try {
      await api.put(`/blog-categories/${id}`, formData);
      addToast('Category updated successfully', 'success');
      mutate();
      router.push('/blog-categories');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update category';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!category && !loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/blog-categories" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="Edit Blog Category"
          description="Update blog category details"
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

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Category'
            )}
          </button>
          <Link href="/blog-categories" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}


