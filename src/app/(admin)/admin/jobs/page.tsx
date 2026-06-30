'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Job, JobStatus, JOB_STATUS_LABELS } from '@/types';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Matching', value: 'matching' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Disputed', value: 'disputed' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-yellow', matching: 'badge-yellow', assigned: 'badge-gray',
  worker_enroute: 'badge-gray', in_progress: 'badge-yellow', completed: 'badge-green',
  cancelled: 'badge-red', disputed: 'badge-red', draft: 'badge-gray',
};

function AdminJobsInner() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await adminApi.listJobs(page, status as JobStatus || undefined);
      setJobs(res.data?.jobs || []);
      setTotal(res.data?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Jobs</h1>
        <p className="text-teal-300/70 text-sm">{total.toLocaleString()} total jobs</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(f => (
          <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${status === f.value ? 'bg-brand-green text-white shadow-green' : 'bg-white/10 text-teal-200 hover:bg-white/20'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center"><p className="text-4xl mb-3">📋</p><p className="text-teal-400">No jobs found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 border-b border-teal-100">
                <tr>{['Job','Customer','Category','Status','Amount','Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-teal-600 font-bold whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-teal-50/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-teal-800 truncate max-w-[200px]">{job.title}</p>
                      <p className="text-xs text-teal-400 font-mono">{job.id.slice(0,8)}…</p>
                    </td>
                    <td className="px-4 py-3 text-teal-700">{job.customer?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-teal-500">{job.categoryName}</td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_BADGE[job.status] || 'badge-gray'}`}>{JOB_STATUS_LABELS[job.status]}</span></td>
                    <td className="px-4 py-3 font-black text-teal-800">₹{Number(job.finalPrice ?? job.estimatedPrice).toLocaleString()}</td>
                    <td className="px-4 py-3 text-teal-400">{new Date(job.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-teal-300/70">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 bg-white/10 text-teal-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white/20 transition">Prev</button>
            <button onClick={() => setPage(p => p+1)} disabled={page*20>=total} className="px-3 py-1.5 bg-white/10 text-teal-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white/20 transition">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>}>
      <AdminJobsInner />
    </Suspense>
  );
}
