import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'draft' | 'published' | 'new' | 'read' | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  inactive: {
    label: 'Inactive',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  },
  published: {
    label: 'Published',
    icon: CheckCircle,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  new: {
    label: 'New',
    icon: AlertCircle,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  read: {
    label: 'Read',
    icon: CheckCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    icon: CheckCircle,
    className: 'bg-muted text-muted-foreground border-border',
  };
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border',
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}


