import useSWR from 'swr';
import { api } from '../../lib/api';
import { useMemo, useState } from 'react';
import Pagination from '../../components/Pagination';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function ActivityLogs() {
  const [page, setPage] = useState(1);
  const key = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    return `/activity?${params.toString()}`;
  }, [page]);
  const { data } = useSWR(key, fetcher);
  return (
    <div style={{ padding: 24 }}>
      <h1>Activity Logs</h1>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th align="left">When</th><th>Action</th><th>Entity</th><th>User</th><th>Meta</th></tr></thead>
        <tbody>
          {data?.items?.map((l: any) => (
            <tr key={l._id} style={{ borderTop: '1px solid #eee' }}>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
              <td>{l.action}</td>
              <td>{l.entity}{l.entityId ? ` (${l.entityId})` : ''}</td>
              <td>{l.user?.email || '-'}</td>
              <td><code style={{ fontSize: 12 }}>{JSON.stringify(l.meta || {}, null, 0).slice(0, 80)}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={data?.page || 1} pages={data?.pages || 1} onPage={setPage} />
    </div>
  );
}


