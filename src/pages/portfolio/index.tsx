import { useListCrud } from '../../hooks/useListCrud';
import Link from 'next/link';
import { FolderKanban, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';

export default function PortfolioList() {
  const {
    data,
    mutate,
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
  } = useListCrud('/portfolio');

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
        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted">
          {value || '-'}
        </span>
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
            href={`/portfolio/${value}`}
            className="btn btn-ghost btn-sm"
            aria-label="Edit"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Portfolio"
        description="Manage your portfolio projects and showcases"
        action={{
          label: 'New Project',
          href: '/portfolio/new',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
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
          data={(data?.items || []) as Record<string, any>[]}
          loading={isLoading}
          emptyMessage={
            <div className="flex flex-col items-center gap-3 py-12">
              <FolderKanban className="w-12 h-12 text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">No projects found</p>
                <p className="text-sm text-muted-foreground">
                  Get started by creating your first project
                </p>
              </div>
              <Link href="/portfolio/new" className="btn btn-primary mt-2">
                New Project
              </Link>
            </div>
          }
          onRowClick={(row) => {
            window.location.href = `/portfolio/${row._id}`;
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
