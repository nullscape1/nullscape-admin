import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Edit } from 'lucide-react';
import { swrFetcher } from '../../lib/swrFetcher';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { api } from '../../lib/api';

export default function GrowthCmsPages() {
  const { data, mutate, isLoading } = useSWR('/cms-v2/pages?limit=200&sort=slug', swrFetcher);

  async function createPage() {
    await api.post('/cms-v2/pages', {
      title: 'New CMS Page',
      slug: `page-${Date.now()}`,
      status: 'draft',
      seoTitle: '',
      seoDescription: '',
    });
    mutate();
  }

  const columns = [
    { header: 'Title', accessor: 'title' as const },
    { header: 'Slug', accessor: 'slug' as const, render: (value: string) => <code>{value}</code> },
    { header: 'Status', accessor: 'status' as const },
    {
      header: 'Actions',
      accessor: '_id' as const,
      className: 'text-right',
      render: (value: string) => (
        <Link href={`/growth-cms/${value}`} className="btn btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}>
          <Edit className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Growth CMS Pages"
        description="Dynamic page manager for renderer-driven website pages"
        action={{
          label: 'Add Page',
          icon: <Plus className="w-4 h-4" />,
          onClick: createPage,
        }}
      />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          columns={columns}
          data={data?.items || []}
          loading={isLoading}
          onRowClick={(row) => {
            window.location.href = `/growth-cms/${row._id}`;
          }}
        />
      </motion.div>
    </div>
  );
}
