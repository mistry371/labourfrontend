'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { jobsApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSocket } from '@/hooks/useSocket';
import { toast } from '@/components/ui/Toast';

const TABS = [
  { label: 'Active', value: 'active' },
  { label: 'History', value: 'history' },
];

export default function WorkerJobsPage() {
  const { socket } = useSocket();
  const [tab, setTab] = useState('active');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingJob, setPendingJob] = useState<any>(null);
  const [responding, setResponding] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await jobsApi.getWorkerJobs(1);
      setJobs(res.data?.assignments || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => { setPendingJob(data); toast.info('New job request!'); };
    socket.on('job:new-assignment', handler);
    return () => { socket.off('job:new-assignment', handler); };
  }, [socket]);

  const handleRespond = async (accept: boolean) => {
    if (!pendingJob) return;
    setResponding(true);
    try {
      await jobsApi.respond(pendingJob.id || pendingJob.jobId, accept);
      toast.success(accept ? 'Job accepted!' : 'Job declined');
      setPendingJob(null);
      if (accept) fetchJobs();
    } catch (e: any) { toast.error(e?.message || 'Failed to respond'); }
    finally { setResponding(false); }
  };

  const activeJobs = jobs.filter(a => ['accepted','active','pending'].includes(a.status));
  const historyJobs = jobs.filter(a => ['completed','rejected','expired'].includes(a.status));
  const displayJobs = tab === 'active' ? activeJobs : historyJobs;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in pb-24">
      {/* Pending Job Alert */}
      {pendingJob && (
        <div className="card-premium p-5 mb-4 border-2 border-green-400 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-black text-green-700 uppercase tracking-wide">New Job Request!</span>
          </div>
          <h3 className="font-black text-teal-800 text-lg mb-1">{pendingJob.title}</h3>
          <p className="text-teal-500 text-sm mb-1">📍 {pendingJob.jobAddress}</p>
          <p className="text-green-600 font-black text-xl mb-4">₹{Number(pendingJob.estimatedPrice).toLocaleString()}</p>
          <div className="flex gap-3">
            <button onClick={() => handleRespond(true)} disabled={responding} className="btn btn-primary flex-1">✅ Accept</button>
            <button onClick={() => handleRespond(false)} disabled={responding} className="btn btn-ghost flex-1 border border-gray-200">❌ Decline</button>
          </div>
        </div>
      )}

      <h1 className="text-xl font-black text-teal-800 mb-4">My Jobs</h1>

      {/* Tabs */}
      <div className="flex bg-teal-50 rounded-xl p-1 mb-4">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.value ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-400 hover:text-teal-600'
            }`}>
            {t.label}
            {t.value === 'active' && activeJobs.length > 0 && (
              <span className="ml-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeJobs.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : displayJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">{tab === 'active' ? '🔍' : '📋'}</p>
          <p className="font-black text-teal-800 text-lg mb-2">{tab === 'active' ? 'No active jobs' : 'No job history'}</p>
          <p className="text-teal-400 text-sm">{tab === 'active' ? 'Go online to receive job requests' : 'Completed jobs will appear here'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayJobs.map(a => (
            <Link key={a.id} href={`/worker/jobs/${a.jobId || a.id}`}
              className="card p-4 flex items-center gap-4 group hover-glow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                🔧
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-teal-800 truncate">{a.job?.title}</p>
                <p className="text-xs text-teal-400 mt-0.5 truncate">📍 {a.job?.jobAddress}</p>
                <p className="text-xs text-teal-300 mt-0.5">{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="text-right shrink-0">
                <StatusBadge status={a.job?.status} />
                <p className="text-sm font-black text-teal-800 mt-1">₹{Number(a.job?.estimatedPrice).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
