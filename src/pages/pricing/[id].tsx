import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { addToast } from '../../lib/toast';
import PageHeader from '../../components/PageHeader';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function EditPricingPlan() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const { data: plan, mutate } = useSWR(id ? `/pricing/${id}` : null, fetcher);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [''],
    popular: false,
    buttonText: 'Get Started',
    buttonLink: '#',
    order: 0,
    status: 'active',
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        currency: plan.currency || 'USD',
        period: plan.period || 'monthly',
        features: plan.features && plan.features.length > 0 ? plan.features : [''],
        popular: plan.popular || false,
        buttonText: plan.buttonText || 'Get Started',
        buttonLink: plan.buttonLink || '#',
        order: plan.order || 0,
        status: plan.status || 'active',
      });
    }
  }, [plan]);

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        features: formData.features.filter((f) => f.trim() !== ''),
        price: formData.price || 0,
      };
      await api.put(`/pricing/${id}`, submitData);
      addToast('Pricing plan updated successfully', 'success');
      mutate();
      router.push('/pricing');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!plan && !loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/pricing" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title="Edit Pricing Plan"
          description="Update pricing plan details"
        />
      </div>

      <form onSubmit={handleSubmit} className="card card-padding space-y-6">
        <div className="form-group">
          <label htmlFor="name">Plan Name *</label>
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
            rows={2}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              id="price"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="input"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="period">Period</label>
            <select
              id="period"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="input"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Features *</label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="input flex-1"
                  placeholder="Feature description"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="btn btn-ghost btn-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddFeature}
              className="btn btn-outline btn-sm"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="buttonText">Button Text</label>
            <input
              id="buttonText"
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="buttonLink">Button Link</label>
            <input
              id="buttonLink"
              type="url"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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

          <div className="form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="checkbox"
              />
              <span>Mark as Popular</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Plan'}
          </button>
          <Link href="/pricing" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

