import { JobStatus, JOB_STATUS_LABELS } from '@/types';
import { clsx } from 'clsx';

const TIMELINE_STEPS: JobStatus[] = [
  'pending', 'assigned', 'in_progress', 'completed',
];

interface Props {
  currentStatus: JobStatus;
}

export function JobStatusTimeline({ currentStatus }: Props) {
  const currentIdx = TIMELINE_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'disputed';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</span>
        <span className="text-sm font-medium text-red-600">{JOB_STATUS_LABELS[currentStatus]}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const future = idx > currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition',
                done && 'bg-green-500 border-green-500 text-white',
                active && 'bg-blue-600 border-blue-600 text-white',
                future && 'bg-white border-gray-300 text-gray-400',
              )}>
                {done ? '✓' : idx + 1}
              </div>
              <span className={clsx(
                'text-xs mt-1 text-center w-16',
                active ? 'text-blue-600 font-medium' : done ? 'text-green-600' : 'text-gray-400',
              )}>
                {JOB_STATUS_LABELS[step]}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className={clsx(
                'flex-1 h-0.5 mb-5 mx-1',
                done ? 'bg-green-400' : 'bg-gray-200',
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
