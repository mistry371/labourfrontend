'use client';
import { clsx } from 'clsx';
import { JobStatus } from '@/types';

interface TimelineStep {
  status: JobStatus;
  label: string;
  description: string;
  icon: string;
}

const STEPS: TimelineStep[] = [
  {
    status: 'pending',
    label: 'Booking Placed',
    description: 'Looking for an available worker',
    icon: '📋',
  },
  {
    status: 'assigned',
    label: 'Worker Assigned',
    description: 'A worker has accepted your job',
    icon: '✅',
  },
  {
    status: 'worker_enroute',
    label: 'On the Way',
    description: 'Worker is heading to your location',
    icon: '🚗',
  },
  {
    status: 'in_progress',
    label: 'Work Started',
    description: 'Worker has arrived and started',
    icon: '🔧',
  },
  {
    status: 'completed',
    label: 'Completed',
    description: 'Job done — please release payment',
    icon: '🎉',
  },
];

const STATUS_ORDER: JobStatus[] = [
  'pending', 'matching', 'assigned', 'worker_enroute', 'in_progress', 'completed',
];

function getStepIndex(status: JobStatus): number {
  // Map matching → pending visually
  const mapped = status === 'matching' ? 'pending' : status;
  return STEPS.findIndex((s) => s.status === mapped);
}

interface Props {
  currentStatus: JobStatus;
  timestamps?: Partial<Record<JobStatus, string>>;
}

export function JobTimeline({ currentStatus, timestamps }: Props) {
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'disputed';
  const currentIdx = getStepIndex(currentStatus);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">
          ❌
        </div>
        <div>
          <p className="font-semibold text-red-700">
            {currentStatus === 'disputed' ? 'Disputed' : 'Cancelled'}
          </p>
          <p className="text-xs text-red-400">This job has been {currentStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const future  = idx > currentIdx;
        const ts      = timestamps?.[step.status];
        const isLast  = idx === STEPS.length - 1;

        return (
          <div key={step.status} className="flex gap-4">
            {/* Left column: icon + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 transition-all duration-500',
                  done   && 'bg-green-500 shadow-sm',
                  active && 'bg-blue-600 shadow-md ring-4 ring-blue-100',
                  future && 'bg-gray-100',
                )}
              >
                {done ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={active ? 'animate-pulse' : ''}>{step.icon}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    'w-0.5 flex-1 my-1 min-h-[24px] transition-colors duration-500',
                    done ? 'bg-green-400' : 'bg-gray-200',
                  )}
                />
              )}
            </div>

            {/* Right column: text */}
            <div className={clsx('pb-5', isLast && 'pb-0')}>
              <p
                className={clsx(
                  'text-sm font-semibold leading-tight',
                  done   && 'text-green-700',
                  active && 'text-blue-700',
                  future && 'text-gray-400',
                )}
              >
                {step.label}
                {active && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600" />
                    </span>
                    Now
                  </span>
                )}
              </p>
              <p className={clsx('text-xs mt-0.5', future ? 'text-gray-300' : 'text-gray-500')}>
                {step.description}
              </p>
              {ts && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
