import useSWR from 'swr';
import { api } from '../../lib/api';
import { useMemo, useState } from 'react';
import Pagination from '../../components/Pagination';
import { addToast } from '../../lib/toast';
import { Mail, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function InquiriesList() {
  const [page, setPage] = useState(1);
  const [resolved, setResolved] = useState<string>('');
  const [limit, setLimit] = useState(10);

  const key = useMemo(() => {
    const params = new URLSearchParams();
    if (resolved) params.set('resolved', resolved);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return `/inquiries?${params.toString()}`;
  }, [resolved, page, limit]);

  const { data, mutate, isLoading } = useSWR(key, fetcher);

  const handleReset = () => {
    setResolved('');
    setPage(1);
    mutate();
    addToast('Filters cleared', 'success', 1500);
  };

  const exportUrl = `${api.defaults.baseURL}/inquiries/export/csv`;

  const columns = [
    {
      header: 'Type',
      accessor: 'type' as const,
      render: (value: string) => (
        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted">
          {value}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: 'name' as const,
      render: (value: string) => <span className="font-semibold">{value || '-'}</span>,
    },
    {
      header: 'Email',
      accessor: 'email' as const,
      render: (value: string) => (
        <span className="text-muted-foreground">{value || '-'}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt' as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'resolved' as const,
      render: (value: boolean) => (
        <StatusBadge status={value ? 'read' : 'new'} />
      ),
    },
    {
      header: 'Actions',
      accessor: '_id' as const,
      className: 'text-right',
      render: (value: string) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="btn btn-ghost btn-sm"
            aria-label="View"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open inquiry detail modal
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inquiries"
        description="Manage customer inquiries and contact forms"
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
          searchValue=""
          onSearchChange={() => {}}
          onReset={handleReset}
          filters={
            <select
              value={resolved}
              onChange={(e) => {
                setResolved(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">All Inquiries</option>
              <option value="true">Resolved</option>
              <option value="false">Pending</option>
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
                <p className="font-medium">No inquiries found</p>
                <p className="text-sm text-muted-foreground">
                  New inquiries will appear here
                </p>
              </div>
            </div>
          }
          onRowClick={(row) => {
            // TODO: Open inquiry detail modal
          }}
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
