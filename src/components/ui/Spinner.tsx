import { clsx } from 'clsx';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'orange' | 'gray';
  className?: string;
}

const SIZES = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-11 w-11 border-[3px]',
};

const COLORS = {
  blue:   'border-blue-200 border-t-blue-600',
  white:  'border-white/30 border-t-white',
  orange: 'border-orange-200 border-t-orange-500',
  gray:   'border-gray-200 border-t-gray-500',
};

export function Spinner({ size = 'md', color = 'blue', className }: Props) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx('animate-spin rounded-full', SIZES[size], COLORS[color], className)}
    />
  );
}

export function PageLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12">
      <Spinner size="md" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
