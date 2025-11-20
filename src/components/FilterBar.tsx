import { Search, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: React.ReactNode;
  onReset?: () => void;
  className?: string;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  filters,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('filter-bar', className)}>
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-11 w-full"
        />
      </div>
      {filters}
      {onReset && (
        <button
          onClick={onReset}
          className="btn btn-outline btn-sm"
        >
          <X className="w-4 h-4" />
          Reset
        </button>
      )}
    </div>
  );
}


