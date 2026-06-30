'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jobsApi } from '@/lib/api';
import { Job, JobStatus, JOB_STATUS_LABELS, SERVICE_CATEGORIES } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

const FILTERS: { label: string; value: JobStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'in_progress' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Disputed', value: 'disputed' },
];

export default function CustomerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<JobStatus | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    jobsApi.getMyJobs(page).then((res: any) => {
      const all: Job[] = res.data?.jobs || [];
      setJobs(filter ? all.filter(j => j.status === filter) : all);
      setTotal(res.data?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, filter]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-teal-800">My Jobs</h1>
          {!loading && <p className="text-sm text-teal-400 mt-0.5">{total} total bookings</p>}
        </div>
        <Link href="/customer/jobs/new" className="btn btn-primary btn-sm">+ Book Service</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === f.value ? 'bg-brand-green text-white shadow-green' : 'bg-white text-teal-600 border border-teal-100 hover:border-green-400'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-black text-teal-800 text-lg mb-2">No jobs yet</p>
          <p className="text-teal-400 text-sm mb-6">Book your first service to get started</p>
          <Link href="/customer/jobs/new" className="btn btn-primary">Book a Service →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const cat = SERVICE_CATEGORIES.find(c => c.id === job.categoryId);
            return (
              <Link key={job.id} href={`/customer/jobs/${job.id}`}
                className="card p-4 flex items-center gap-4 group hover-glow">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {cat?.icon || '🔧'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-teal-800 truncate">{job.title}</p>
                  <p className="text-xs text-teal-400 mt-0.5 truncate">📍 {job.jobAddress}</p>
                  <p className="text-xs text-teal-300 mt-0.5">
                    {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={job.status} />
                  <p className="text-sm font-black text-teal-800 mt-1.5">
                    ₹{Number(job.finalPrice ?? job.estimatedPrice).toLocaleString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn btn-ghost btn-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-teal-600 font-medium">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={jobs.length < 20}
            className="btn btn-ghost btn-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
