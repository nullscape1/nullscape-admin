import useSWR from 'swr';
import { api } from '../../lib/api';
import { useMemo, useState } from 'react';
import Pagination from '../../components/Pagination';
import { addToast } from '../../lib/toast';
import { Mail, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function NewsletterList() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const key = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return `/newsletter?${params.toString()}`;
  }, [q, status, page, limit]);

  const { data, mutate, isLoading } = useSWR(key, fetcher);
  const exportUrl = `${api.defaults.baseURL}/newsletter/export/csv`;

  const handleReset = () => {
    setQ('');
    setStatus('');
    setPage(1);
    mutate();
    addToast('Filters cleared', 'success', 1500);
  };

  const columns = [
    {
      header: 'Email',
      accessor: 'email' as const,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      header: 'Subscribed',
      accessor: 'createdAt' as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => <StatusBadge status={value || 'active'} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Newsletter Subscribers"
        description="Manage your newsletter subscribers and email list"
        action={{
          label: 'Export CSV',
          href: exportUrl,
          icon: <Download className="w-4 h-4" />,
          external: true,
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
              <Mail className="w-12 h-12 text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">No subscribers found</p>
                <p className="text-sm text-muted-foreground">
                  Subscribers will appear here once they sign up
                </p>
              </div>
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
