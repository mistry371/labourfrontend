'use client';
import { JobAssignment } from '@/types';

interface Props {
  assignment: JobAssignment;
  distanceKm: number | null;
  etaMinutes: number | null;
  jobStatus: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function WorkerCard({ assignment, distanceKm, etaMinutes, jobStatus }: Props) {
  const worker = assignment.worker;
  const user = worker?.user;
  const phone = user?.phone;

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const etaLabel = (() => {
    if (jobStatus === 'in_progress') return 'Job in progress';
    if (jobStatus === 'completed') return 'Job completed';
    if (etaMinutes !== null) {
      if (etaMinutes < 1) return 'Arriving now';
      if (etaMinutes === 1) return '~1 min away';
      return `~${etaMinutes} min away`;
    }
    if (distanceKm !== null) return `${distanceKm.toFixed(1)} km away`;
    return null;
  })();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm">
              {initials}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-base truncate">{user?.name ?? 'Worker'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarRating rating={worker?.averageRating ?? 0} />
              <span className="text-xs text-gray-500">
                {worker?.averageRating?.toFixed(1)} · {worker?.totalJobsCompleted} jobs
              </span>
            </div>
            {etaLabel && (
              <div className="flex items-center gap-1 mt-1">
                {jobStatus === 'worker_enroute' && etaMinutes !== null && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                  </span>
                )}
                <span className={`text-xs font-medium ${
                  jobStatus === 'worker_enroute' ? 'text-blue-600' :
                  jobStatus === 'in_progress' ? 'text-orange-600' :
                  'text-gray-500'
                }`}>
                  {etaLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {phone && (
        <div className="grid grid-cols-2 border-t border-gray-100">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition border-r border-gray-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Worker
          </a>
          <a
            href={`sms:${phone}`}
            className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </a>
        </div>
      )}
    </div>
  );
}
