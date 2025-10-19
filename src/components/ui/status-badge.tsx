import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'published' | 'draft' | 'archived' | 'pending';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    published: {
      label: 'Published',
      className: 'bg-status-green text-white'
    },
    draft: {
      label: 'Draft',
      className: 'bg-yellow-100 text-yellow-800'
    },
    archived: {
      label: 'Archived',
      className: 'bg-status-gray text-gray-700'
    },
    pending: {
      label: 'Pending',
      className: 'bg-blue-100 text-blue-800'
    }
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}