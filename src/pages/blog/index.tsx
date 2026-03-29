import { useMemo } from 'react';
import { useListCrud } from '../../hooks/useListCrud';
import Link from 'next/link';
import { BookOpen, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';

const blogListSortParams = { sort: '-publishedAt' };

export default function BlogList() {
  const sortParams = useMemo(() => blogListSortParams, []);
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
  } = useListCrud('/blog', { extraParams: sortParams });

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as const,
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      header: 'Published',
      accessor: 'publishedAt' as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString() : 'Not published'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id' as const,
      className: 'text-right',
      render: (value: string) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/blog/${value}`}
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
        title="Blog Posts"
        description="Manage your blog articles and content"
        action={{
          label: 'New Post',
          href: '/blog/new',
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
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
              <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">No blog posts found</p>
                <p className="text-sm text-muted-foreground">
                  Get started by creating your first blog post
                </p>
              </div>
              <Link href="/blog/new" className="btn btn-primary mt-2">
                New Post
              </Link>
            </div>
          }
          onRowClick={(row) => {
            window.location.href = `/blog/${row._id}`;
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
