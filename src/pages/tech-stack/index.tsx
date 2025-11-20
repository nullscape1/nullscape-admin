import useSWR from 'swr';
import { api } from '../../lib/api';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Pagination from '../../components/Pagination';
import { addToast } from '../../lib/toast';
import { Edit, Trash2, Code, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function TechStackList() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const key = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return `/tech-stack?${params.toString()}`;
  }, [q, status, category, page, limit]);

  const { data, mutate, isLoading } = useSWR(key, fetcher);
  
  const revalidate = () => mutate();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tech stack item?')) return;
    try {
      await api.delete(`/tech-stack/${id}`);
      addToast('Tech stack item deleted successfully', 'success');
      revalidate();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to delete item', 'error');
    }
  };

  const handleReset = () => {
    setQ('');
    setStatus('');
    setCategory('');
    setPage(1);
    mutate();
    addToast('Filters cleared', 'success', 1500);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as const,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          {row.icon && (
            <img src={row.icon} alt={value} className="w-8 h-8 rounded" />
          )}
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category' as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">{value || 'Other'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      header: 'Order',
      accessor: 'order' as const,
      render: (value: number) => <span className="text-sm">{value || 0}</span>,
    },
    {
      header: 'Actions',
      accessor: '_id' as const,
      className: 'text-right',
      render: (value: string) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/tech-stack/${value}`}
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
        title="Tech Stack"
        description="Manage technologies displayed on the website"
        action={{
          label: 'New Tech',
          href: '/tech-stack/new',
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
            <>
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
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Cloud">Cloud</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
                <option value="Other">Other</option>
              </select>
            </>
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
              <Code className="w-12 h-12 text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">No tech stack items found</p>
                <p className="text-sm text-muted-foreground">
                  Get started by adding technologies to your stack
                </p>
              </div>
              <Link href="/tech-stack/new" className="btn btn-primary mt-2">
                <Plus className="w-4 h-4" />
                New Tech
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

