import { clsx } from 'clsx';

// ─── Primitive ────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />;
}

// ─── Generic card skeleton ────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-3', i === lines - 2 ? 'w-1/2' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

// ─── Job card skeleton ────────────────────────────────────────────────────────
export function SkeletonJobCard() {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// ─── Stat card skeleton ───────────────────────────────────────────────────────
export function SkeletonStatCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Table row skeleton ───────────────────────────────────────────────────────
export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-50">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-5 py-4">
              <Skeleton className={clsx('h-3', c === 0 ? 'w-3/4' : c === cols - 1 ? 'w-16' : 'w-1/2')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Profile skeleton ─────────────────────────────────────────────────────────
export function SkeletonProfile() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
