import useSWR from 'swr';
import { api } from '../../lib/api';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Pagination from '../../components/Pagination';
import { addToast } from '../../lib/toast';
import { Edit, Trash2, DollarSign, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { useApi } from '../../lib/useApi';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function PricingPlansList() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { call: deletePlan } = useApi(
    (id: string) => api.delete(`/pricing/${id}`),
    { success: 'Pricing plan deleted', error: 'Failed to delete pricing plan' }
  );

  const key = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return `/pricing?${params.toString()}`;
  }, [q, status, page, limit]);

  const { data, mutate, isLoading } = useSWR(key, fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    try {
      await deletePlan(id);
      mutate();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to delete plan', 'error');
    }
  };

  const handleReset = () => {
    setQ('');
    setStatus('');
    setPage(1);
    mutate();
    addToast('Filters cleared', 'success', 1500);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as const,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {row.popular && (
            <span className="badge badge-primary badge-sm">Popular</span>
          )}
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price' as const,
      render: (value: number, row: any) => {
        if (value === 0 || value === null) return <span>Custom</span>;
        const period = row.period === 'monthly' ? '/mo' : row.period === 'yearly' ? '/yr' : '';
        return <span className="font-medium">${value.toLocaleString()}{period}</span>;
      },
    },
    {
      header: 'Period',
      accessor: 'period' as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground capitalize">{value || 'monthly'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      header: 'Actions',
      accessor: '_id' as const,
      className: 'text-right',
      render: (value: string) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/pricing/${value}`}
            className="btn btn-ghost btn-sm"
            aria-label="Edit"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(value)}
            className="btn btn-ghost btn-sm text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pricing Plans"
        description="Manage pricing plans displayed on the website"
        action={{
          label: 'New Plan',
          href: '/pricing/new',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterBar
          searchValue={q}
          onSearchChange={(value) => {
            setQ(value);
            setPage(1);
          }}
          onReset={handleReset}
          filters={
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          columns={columns}
          data={data?.items || []}
          loading={isLoading}
          emptyMessage={
            <div className="flex flex-col items-center gap-3 py-12">
              <DollarSign className="w-12 h-12 text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">No pricing plans found</p>
                <p className="text-sm text-muted-foreground">
                  Get started by creating your first pricing plan
                </p>
              </div>
              <Link href="/pricing/new" className="btn btn-primary mt-2">
                <Plus className="w-4 h-4" />
                New Plan
              </Link>
            </div>
          }
        />
      </motion.div>

      {data && data.pages > 1 && (
        <Pagination
          page={data.page || 1}
          pages={data.pages || 1}
          onPage={setPage}
          pageSize={limit}
          onPageSizeChange={(n) => {
            setLimit(n);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}


