'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { workerApi, jobsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';

const BADGES = [
  { id: 'newcomer', icon: '🌱', label: 'Newcomer', req: 0 },
  { id: 'rising', icon: '⭐', label: 'Rising Star', req: 10 },
  { id: 'pro', icon: '🏆', label: 'Pro Worker', req: 50 },
  { id: 'elite', icon: '💎', label: 'Elite', req: 100 },
];

export default function WorkerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { socket } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [pendingJob, setPendingJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      workerApi.getProfile().catch(() => null),
      jobsApi.getWorkerJobs(1).catch(() => null),
    ]).then(([profile, jobs]) => {
      if (profile?.data) {
        setStats(profile.data);
        setOnline(profile.data.onlineStatus === 'online');
      }
      const jobList = jobs?.data?.assignments || [];
      setActiveJob(jobList.find((j: any) => ['assigned','worker_enroute','in_progress'].includes(j.job?.status)));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      setPendingJob(data);
      toast.info(`New job: ${data.title}`);
    };
    socket.on('job:new-assignment', handler);
    return () => { socket.off('job:new-assignment', handler); };
  }, [socket]);

  const toggleOnline = useCallback(async () => {
    setToggling(true);
    try {
      await workerApi.toggleOnline(!online);
      setOnline(o => !o);
      toast.success(online ? 'You are now offline' : 'You are now online!');
    } catch { toast.error('Failed to update status'); }
    finally { setToggling(false); }
  }, [online]);

  const handleJobResponse = useCallback(async (accept: boolean) => {
    if (!pendingJob) return;
    try {
      if (accept) {
        await jobsApi.respond(pendingJob.assignmentId, true);
        toast.success('Job accepted!');
        router.push(`/worker/jobs/${pendingJob.jobId || pendingJob.id}`);
      } else {
        await jobsApi.respond(pendingJob.assignmentId, false);
        toast.info('Job declined');
      }
    } catch { toast.error('Failed to respond'); }
    finally { setPendingJob(null); }
  }, [pendingJob, router]);

  const completedJobs = stats?.totalJobsCompleted || 0;
  const currentBadge = BADGES.filter(b => completedJobs >= b.req).pop() || BADGES[0];
  const nextBadge = BADGES.find(b => completedJobs < b.req);
  const progress = nextBadge ? Math.round((completedJobs / nextBadge.req) * 100) : 100;

  return (
    <div className="pb-24 sm:pb-8 animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f2330, #1b3a4b, #254d63)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-blob" />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-300/70 text-sm mb-1">Welcome back,</p>
              <h1 className="text-2xl font-black text-white">{user?.name?.split(' ')[0]} 👷</h1>
            </div>
            <button onClick={toggleOnline} disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${online ? 'bg-green-500 text-white shadow-green' : 'bg-white/10 text-teal-200 border border-white/20'}`}>
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-white animate-pulse' : 'bg-teal-400'}`} />
              {toggling ? '...' : online ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-5 relative z-10">
        {/* Pending Job Alert */}
        {pendingJob && (
          <div className="card-premium p-5 border-2 border-green-400 animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-green-700 uppercase tracking-wide">New Job Request!</span>
            </div>
            <h3 className="font-black text-teal-800 text-lg mb-1">{pendingJob.title}</h3>
            <p className="text-teal-500 text-sm mb-1">📍 {pendingJob.jobAddress}</p>
            <p className="text-green-600 font-bold mb-4">₹{Number(pendingJob.estimatedPrice).toLocaleString()}</p>
            <div className="flex gap-3">
              <button onClick={() => handleJobResponse(true)} className="btn btn-primary flex-1">✅ Accept</button>
              <button onClick={() => handleJobResponse(false)} className="btn btn-ghost flex-1 border border-gray-200">❌ Decline</button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'This Month', value: `₹${(stats?.wallet?.balance || 0).toLocaleString()}`, icon: '💰', color: 'text-green-600' },
              { label: 'Jobs Done', value: completedJobs, icon: '✅', color: 'text-teal-700' },
              { label: 'Rating', value: `${stats?.rating || '—'}★`, icon: '⭐', color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-teal-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Badge Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentBadge.icon}</span>
              <div>
                <p className="font-bold text-teal-800">{currentBadge.label}</p>
                <p className="text-xs text-teal-400">Current Level</p>
              </div>
            </div>
            {nextBadge && (
              <div className="text-right">
                <p className="text-xs text-teal-400">Next: {nextBadge.label} {nextBadge.icon}</p>
                <p className="text-xs font-bold text-green-600">{nextBadge.req - completedJobs} jobs to go</p>
              </div>
            )}
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2.5 bg-brand-green rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-teal-400 mt-1.5">{completedJobs} / {nextBadge?.req || completedJobs} jobs completed</p>
        </div>

        {/* Active Job */}
        {activeJob && (
          <Link href={`/worker/jobs/${activeJob.jobId}`} className="block card-premium p-5 border-l-4 border-green-500">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Active Job</p>
            <h3 className="font-black text-teal-800 mb-1">{activeJob.job?.title}</h3>
            <p className="text-sm text-teal-500 mb-3">📍 {activeJob.job?.jobAddress}</p>
            <div className="flex items-center justify-between">
              <StatusBadge status={activeJob.job?.status} />
              <span className="text-green-600 font-bold">₹{Number(activeJob.job?.estimatedPrice).toLocaleString()}</span>
            </div>
          </Link>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/worker/jobs', icon: '📋', label: 'My Jobs', sub: 'View all assignments' },
            { href: '/worker/earnings', icon: '💰', label: 'Earnings', sub: 'Track your income' },
            { href: '/worker/kyc', icon: '🪪', label: 'KYC Status', sub: 'Verify your profile' },
            { href: '/worker/profile', icon: '👤', label: 'Profile', sub: 'Edit your details' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="card p-4 group hover-glow">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
              <p className="font-bold text-teal-800 text-sm">{item.label}</p>
              <p className="text-xs text-teal-400">{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
