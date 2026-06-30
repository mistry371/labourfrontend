import { clsx } from 'clsx';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({ icon = '📭', title, description, action, compact, className }: Props) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center text-center animate-fade-in',
      compact ? 'py-8 px-4' : 'py-16 px-6',
      className,
    )}>
      <div className={clsx(
        'flex items-center justify-center rounded-2xl mb-4',
        compact ? 'w-14 h-14 text-3xl bg-gray-50' : 'w-20 h-20 text-4xl bg-gray-50',
      )}>
        {icon}
      </div>
      <h3 className={clsx(
        'font-semibold text-gray-900',
        compact ? 'text-base' : 'text-lg',
      )}>
        {title}
      </h3>
      {description && (
        <p className={clsx(
          'text-gray-500 mt-1.5 max-w-xs',
          compact ? 'text-xs' : 'text-sm',
        )}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
