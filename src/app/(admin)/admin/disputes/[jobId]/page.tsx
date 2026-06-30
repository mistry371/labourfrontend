'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Job } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';

export default function DisputeDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [outcome, setOutcome] = useState<'refund' | 'release' | 'split'>('refund');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    adminApi.getDisputeDetail(jobId).then((res: any) => setJob(res.data)).catch(() => toast.error('Failed to load dispute')).finally(() => setLoading(false));
  }, [jobId]);

  const handleClose = async () => {
    if (!resolution.trim()) return toast.error('Enter resolution notes');
    setActing(true);
    try {
      await adminApi.closeDispute(jobId, resolution, outcome);
      toast.success('Dispute resolved');
      router.push('/admin/disputes');
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setActing(false); }
  };

  const handleRefund = async () => {
    if (!resolution.trim()) return toast.error('Enter reason');
    setActing(true);
    try {
      await adminApi.refundCustomer(jobId, resolution);
      toast.success('Refund initiated');
      router.push('/admin/disputes');
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setActing(false); }
  };

  const handlePenalize = async () => {
    if (!resolution.trim()) return toast.error('Enter reason');
    setActing(true);
    try {
      await adminApi.penalizeWorker(jobId, resolution, penaltyAmount ? Number(penaltyAmount) : undefined);
      toast.success('Worker penalized');
      router.push('/admin/disputes');
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setActing(false); }
  };

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>;
  if (!job) return <div className="p-6 text-center text-teal-300">Dispute not found</div>;

  const worker = job.assignments?.find(a => ['accepted','active','completed'].includes(a.status))?.worker;
  const payment = job.payments?.[0];

  return (
    <div className="p-6 max-w-3xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-teal-200 hover:bg-white/20 transition">←</button>
        <div>
          <h1 className="text-xl font-black text-white">Dispute Resolution</h1>
          <p className="text-teal-300/70 text-sm">#{job.id.slice(0,8).toUpperCase()}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Job Info */}
      <div className="card p-5">
        <h3 className="font-bold text-teal-800 mb-3">Job Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-teal-500">Title</span><span className="font-semibold text-teal-800">{job.title}</span></div>
          <div className="flex justify-between"><span className="text-teal-500">Category</span><span className="text-teal-700">{job.categoryName}</span></div>
          <div className="flex justify-between"><span className="text-teal-500">Address</span><span className="text-teal-700 text-right max-w-[60%]">{job.jobAddress}</span></div>
          <div className="flex justify-between"><span className="text-teal-500">Amount</span><span className="font-black text-teal-800">₹{Number(job.finalPrice ?? job.estimatedPrice).toLocaleString()}</span></div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-wide mb-2">Customer</p>
          <p className="font-bold text-teal-800">{job.customer?.name}</p>
          <p className="text-sm text-teal-400">{job.customer?.phone}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-wide mb-2">Worker</p>
          <p className="font-bold text-teal-800">{worker?.user?.name ?? '—'}</p>
          <p className="text-sm text-teal-400">{worker?.user?.phone ?? '—'}</p>
        </div>
      </div>

      {/* Payment */}
      {payment && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-3">Payment</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-teal-500">Amount</span><span className="font-black text-teal-800">₹{Number(payment.amount).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-teal-500">Status</span><span className="capitalize text-teal-700">{payment.status.replace(/_/g,' ')}</span></div>
            {payment.razorpayPaymentId && <div className="flex justify-between"><span className="text-teal-500">Payment ID</span><span className="font-mono text-xs text-teal-400">{payment.razorpayPaymentId}</span></div>}
          </div>
        </div>
      )}

      {/* Resolution */}
      <div className="card p-5">
        <h3 className="font-bold text-teal-800 mb-4">Resolution</h3>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-700 mb-1.5">Resolution Notes <span className="text-red-500">*</span></label>
          <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
            placeholder="Describe the resolution decision..." className="input w-full resize-none" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-700 mb-2">Outcome</label>
          <div className="grid grid-cols-3 gap-2">
            {[['refund','↩ Refund Customer'],['release','✅ Release to Worker'],['split','⚖️ Split Payment']].map(([v,l]) => (
              <button key={v} onClick={() => setOutcome(v as any)}
                className={`py-2.5 rounded-xl text-sm font-bold transition ${outcome === v ? 'bg-brand-green text-white shadow-green' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {outcome === 'split' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-teal-700 mb-1.5">Worker Penalty Amount (₹)</label>
            <input type="number" value={penaltyAmount} onChange={e => setPenaltyAmount(e.target.value)}
              placeholder="0" className="input w-full" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleRefund} disabled={acting}
            className="py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-50 text-sm">
            ↩ Refund
          </button>
          <button onClick={handlePenalize} disabled={acting}
            className="py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 text-sm">
            ⚠ Penalize
          </button>
          <button onClick={handleClose} disabled={acting}
            className="py-2.5 bg-brand-green text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 text-sm shadow-green">
            {acting ? '⏳...' : '✓ Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
