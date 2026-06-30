'use client';
import { clsx } from 'clsx';

export interface Step {
  label: string;
  description?: string;
}

interface Props {
  steps: Step[];
  current: number; // 0-indexed
}

export function Stepper({ steps, current }: Props) {
  return (
    <nav aria-label="Progress" className="w-full">
      {/* Mobile: compact pill */}
      <div className="flex sm:hidden items-center justify-between mb-1">
        <span className="text-sm font-semibold text-blue-600">
          Step {current + 1} of {steps.length}
        </span>
        <span className="text-sm text-gray-500">{steps[current]?.label}</span>
      </div>
      <div className="sm:hidden h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden sm:flex items-center w-full">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.label}
              className={clsx('flex items-center', i < steps.length - 1 && 'flex-1')}
            >
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                    done && 'bg-blue-600 border-blue-600 text-white',
                    active && 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100',
                    !done && !active && 'bg-white border-gray-300 text-gray-400',
                  )}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={clsx(
                    'mt-1.5 text-xs font-medium whitespace-nowrap',
                    active ? 'text-blue-600' : done ? 'text-gray-600' : 'text-gray-400',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-3 mb-5 transition-colors',
                    i < current ? 'bg-blue-600' : 'bg-gray-200',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
