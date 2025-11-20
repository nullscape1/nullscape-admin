type Props = {
  page: number;
  pages: number;
  onPage: (p: number) => void;
  pageSize?: number;
  onPageSizeChange?: (s: number) => void;
};

export default function Pagination({ page, pages, onPage, pageSize, onPageSizeChange }: Props) {
  if (!pages || pages <= 1) return null;
  const prev = Math.max(1, page - 1);
  const next = Math.min(pages, page + 1);
  function onJump(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('jump') as HTMLInputElement;
    const n = Math.max(1, Math.min(pages, Number(input.value || 1)));
    onPage(n);
  }
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
      <button disabled={page <= 1} onClick={() => onPage(prev)}>Prev</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onPage(next)}>Next</button>
      <form onSubmit={onJump} style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
        <label style={{ margin: 0 }}>Go to</label>
        <input name="jump" type="number" min={1} max={pages} defaultValue={page} style={{ width: 70 }} />
        <button className="btn secondary" type="submit">Go</button>
      </form>
      {onPageSizeChange && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ margin: 0 }}>Per page</label>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}
    </div>
  );
}


