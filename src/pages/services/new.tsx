import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { addToast } from '../../lib/toast';
import { Save, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import Link from 'next/link';
import StatusBadge from '../../components/StatusBadge';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function NewService() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');
  const { call, loading } = useApi(
    (payload: any) => api.post('/services', payload),
    { success: 'Service created', error: 'Failed to create service' }
  );
  
  const { data: categoriesData } = useSWR('/service-categories?status=active&limit=100', fetcher);
  const categories = categoriesData?.items || [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await call({ name, description, icon, category, order, status });
      addToast('Service created successfully', 'success');
      router.push('/services');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create service');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="New Service"
        description="Create a new service offering"
        action={{
          label: 'Back to Services',
          href: '/services',
          icon: <ArrowLeft className="w-4 h-4" />,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card card-padding"
      >
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-3">
              Service Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input w-full"
              placeholder="e.g., Web Development"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-3">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="input w-full resize-none"
              placeholder="Describe your service..."
            />
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-semibold mb-3">
              Icon URL
            </label>
            <input
              id="icon"
              type="url"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="input w-full"
              placeholder="https://example.com/icon.svg"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold mb-3">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input w-full"
            >
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-semibold mb-3">
              Display Order
            </label>
            <input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="input w-full"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold mb-3">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="input w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="mt-2">
              <StatusBadge status={status} />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

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
                  Save Service
                </>
              )}
            </button>
            <Link href="/services" className="btn btn-outline">
              <X className="w-4 h-4" />
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
