import useSWR from 'swr';
import { api } from '../../lib/api';
import Link from 'next/link';
import { FileText, Edit, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function CmsPages() {
  const { data, mutate, isLoading } = useSWR('/cms/pages', fetcher);

  const columns = [
    {
      header: 'Page',
      accessor: 'page' as const,
      render: (value: string) => (
        <span className="font-semibold capitalize">{value || '-'}</span>
      ),
    },
    {
      header: 'Sections',
      accessor: 'sections' as const,
      render: (value: any[]) => (
        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted">
          {value?.length || 0} section(s)
        </span>
      ),
    },
    {
      header: 'Last Updated',
      accessor: 'updatedAt' as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id' as const,
      className: 'text-right',
      render: (value: string, row: any) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/cms/${value}`}
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
        title="CMS Pages"
        description="Manage your website pages and content sections"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          columns={columns}
          data={data?.items || []}
          loading={isLoading}
          emptyMessage={
            <div className="flex flex-col items-center gap-3 py-12">
              <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">No CMS pages found</p>
                <p className="text-sm text-muted-foreground">
                  CMS pages will appear here once created
                </p>
              </div>
            </div>
          }
          onRowClick={(row) => {
            window.location.href = `/cms/${row._id}`;
          }}
        />
      </motion.div>
    </div>
  );
}
