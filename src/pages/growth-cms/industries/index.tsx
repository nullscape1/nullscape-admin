import { useListCrud } from '../../../hooks/useListCrud';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../../components/PageHeader';
import FilterBar from '../../../components/FilterBar';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBadge';

export default function IndustriesCmsList() {
  const {
    data,
    isLoading,
    q,
    setQ,
    status,
    setStatus,
    page,
    setPage,
    limit,
    setLimit,
    handleReset,
  } = useListCrud('/cms-v2/industries', { defaultLimit: 20 });

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as const,
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      header: 'Category',
      accessor: 'category' as const,
      render: (value: string) => (
        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted">{value || '—'}</span>
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
        <Link
          href={`/growth-cms/industries/${value}`}
          className="btn btn-ghost btn-sm"
          aria-label="Edit"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Industries (website)"
        description="Published industries appear on the homepage (GET /industries). Map summary in content.summary."
        action={{
          label: 'New industry',
          href: '/growth-cms/industries/new',
        }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <FilterBar
          searchValue={q}
          onSearchChange={(v) => {
            setQ(v);
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
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          }
        />
        <DataTable
          columns={columns}
          data={(data?.items || []) as Record<string, any>[]}
          loading={isLoading}
          onRowClick={(row) => {
            window.location.href = `/growth-cms/industries/${row._id}`;
          }}
        />
        {data && data.pages > 1 && (
          <Pagination
            page={data.page || 1}
            pages={data.pages || 1}
            onPage={setPage}
            pageSize={limit}
            onPageSizeChange={(n: number) => {
              setLimit(n);
              setPage(1);
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
