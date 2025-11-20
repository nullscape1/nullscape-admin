import useSWR from 'swr';
import { api } from '../../lib/api';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Pagination from '../../components/Pagination';
import { addToast } from '../../lib/toast';
import { MessageSquare, Edit, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { cn } from '../../lib/utils';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function TestimonialsList() {
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
    return `/testimonials?${params.toString()}`;
  }, [q, status, page, limit]);

  const { data, mutate, isLoading } = useSWR(key, fetcher);

  const handleReset = () => {
    setQ('');
    setStatus('');
    setPage(1);
    mutate();
    addToast('Filters cleared', 'success', 1500);
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              'w-4 h-4',
              i <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-muted-foreground'
            )}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const columns = [
    {
      header: 'Client',
      accessor: 'clientName' as const,
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      header: 'Rating',
      accessor: 'rating' as const,
      render: (value: number) => renderRating(value || 0),
    },
    {
      header: 'Testimonial',
      accessor: 'testimonial' as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
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
            href={`/testimonials/${value}`}
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
        title="Testimonials"
        description="Manage client testimonials and reviews"
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
              <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">No testimonials found</p>
                <p className="text-sm text-muted-foreground">
                  Add testimonials to showcase client feedback
                </p>
              </div>
            </div>
          }
          onRowClick={(row) => {
            window.location.href = `/testimonials/${row._id}`;
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
