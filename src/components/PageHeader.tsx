import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
    external?: boolean;
  };
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          action.href ? (
            action.external ? (
              <a
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                {action.icon || <Plus className="w-4 h-4" />}
                {action.label}
              </a>
            ) : (
              <Link href={action.href} className="btn btn-primary">
                {action.icon || <Plus className="w-4 h-4" />}
                {action.label}
              </Link>
            )
          ) : (
            <button onClick={action.onClick} className="btn btn-primary">
              {action.icon || <Plus className="w-4 h-4" />}
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
