import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { addToast } from '../../lib/toast';
import PageHeader from '../../components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTechStack() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    category: 'Other',
    description: '',
    order: 0,
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tech-stack', formData);
      addToast('Tech stack item created successfully', 'success');
      router.push('/tech-stack');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to create item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/tech-stack" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="New Tech Stack Item"
          description="Add a new technology to your stack"
        />
      </div>

      <form onSubmit={handleSubmit} className="card card-padding space-y-6">
        <div className="form-group">
          <label htmlFor="name">Technology Name *</label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="e.g., React, Node.js, MongoDB"
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
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="Cloud">Cloud</option>
              <option value="Mobile">Mobile</option>
              <option value="DevOps">DevOps</option>
              <option value="Other">Other</option>
            </select>
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
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={3}
            placeholder="Brief description of the technology"
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

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Item'}
          </button>
          <Link href="/tech-stack" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

