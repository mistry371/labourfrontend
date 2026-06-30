'use client';
import { SocketStatus } from '@/hooks/useSocket';
import { clsx } from 'clsx';

interface Props {
  status: SocketStatus;
}

const CONFIG: Record<SocketStatus, { label: string; dot: string; bar: string }> = {
  connected:    { label: 'Live',         dot: 'bg-green-500',  bar: 'bg-green-500' },
  connecting:   { label: 'Connecting…',  dot: 'bg-yellow-400', bar: 'bg-yellow-400' },
  disconnected: { label: 'Reconnecting…',dot: 'bg-gray-400',   bar: 'bg-gray-400' },
  error:        { label: 'Connection error', dot: 'bg-red-500', bar: 'bg-red-500' },
};

export function ConnectionStatus({ status }: Props) {
  const cfg = CONFIG[status];
  const isLive = status === 'connected';

  return (
    <div
      className={clsx(
        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all',
        isLive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500',
      )}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', cfg.dot)} />
        )}
        <span className={clsx('relative inline-flex rounded-full h-2 w-2', cfg.dot)} />
      </span>
      {cfg.label}
    </div>
  );
}
