import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  render?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string | ReactNode;
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  getRowId?: (row: T) => string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  getRowId = (row) => row._id || row.id,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="p-6">
          <div className="skeleton h-12 w-full mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 w-full mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead className="table-header">
          <tr className="table-header-row">
            {onSelectRow && (
              <th className="table-header-cell w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="rounded border-input"
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th key={index} className={cn('table-header-cell', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onSelectRow ? 1 : 0)}
                className="text-center py-12"
              >
                {typeof emptyMessage === 'string' ? (
                  <span className="text-muted-foreground">{emptyMessage}</span>
                ) : (
                  emptyMessage
                )}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.includes(rowId);
              return (
                <tr
                  key={rowId}
                  className={cn(
                    'table-row cursor-pointer',
                    isSelected && 'bg-muted/50',
                    onRowClick && 'hover:bg-muted/30'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {onSelectRow && (
                    <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectRow(rowId, e.target.checked)}
                        className="rounded border-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => {
                    let value: any;
                    if (typeof column.accessor === 'function') {
                      value = column.accessor(row);
                    } else {
                      value = row[column.accessor];
                    }
                    return (
                      <td key={colIndex} className={cn('table-cell', column.className)}>
                        {column.render ? column.render(value, row) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

