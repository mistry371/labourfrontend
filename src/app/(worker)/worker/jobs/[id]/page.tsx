'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';

export default function WorkerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    jobsApi.getById(id).then((res: any) => setJob(res.data)).catch(() => toast.error('Failed to load job')).finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  const handleStart = async () => {
    if (!otp.trim()) return toast.error('Enter the OTP from customer');
    setStarting(true);
    try {
      await jobsApi.start(id, otp);
      toast.success('Job started!');
      reload();
    } catch (e: any) { toast.error(e?.message || 'Invalid OTP'); }
    finally { setStarting(false); }
  };

  const handleComplete = async () => {
    if (proofFiles.length === 0) return toast.error('Upload at least one proof photo');
    setUploading(true);
    try {
      // Upload proof images
      const urls: string[] = [];
      for (const file of proofFiles) {
        const fd = new FormData();
        fd.append('file', file);
        const res: any = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/storage/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          body: fd,
        }).then(r => r.json());
        urls.push(res.data?.url || res.url);
      }
      setUploading(false);
      setCompleting(true);
      await jobsApi.complete(id, urls);
      toast.success('Job completed!');
      router.push('/worker/jobs');
    } catch (e: any) { toast.error(e?.message || 'Failed to complete job'); }
    finally { setUploading(false); setCompleting(false); }
  };

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
    </div>
  );

  if (!job) return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <p className="text-5xl mb-4">😕</p>
      <p className="font-black text-teal-800 text-lg">Job not found</p>
    </div>
  );

  const canStart = job.status === 'assigned' || job.status === 'worker_enroute';
  const canComplete = job.status === 'in_progress';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white rounded-xl border border-teal-100 flex items-center justify-center text-teal-600">←</button>
        <div className="flex-1">
          <h1 className="font-black text-teal-800 text-lg leading-tight">{job.title}</h1>
          <p className="text-xs text-teal-400">#{job.id?.slice(0,8).toUpperCase()}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Customer Info */}
      <div className="card p-5">
        <h3 className="font-bold text-teal-800 mb-3 text-sm">Customer</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white font-black text-lg">
            {job.customer?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-teal-800">{job.customer?.name}</p>
            <p className="text-xs text-teal-400">📍 {job.jobAddress}</p>
          </div>
          <a href={`tel:${job.customer?.phone}`} className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-100 transition">📞</a>
        </div>
      </div>

      {/* Job Details */}
      <div className="card p-5">
        <h3 className="font-bold text-teal-800 mb-3 text-sm">Job Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-teal-500">Category</span><span className="font-medium text-teal-800">{job.categoryName}</span></div>
          <div className="flex justify-between"><span className="text-teal-500">Earnings</span><span className="font-black text-green-600 text-base">₹{Number(job.workerEarnings ?? job.estimatedPrice).toLocaleString()}</span></div>
          {job.scheduledAt && <div className="flex justify-between"><span className="text-teal-500">Scheduled</span><span className="font-medium text-teal-800">{new Date(job.scheduledAt).toLocaleString('en-IN')}</span></div>}
          {job.description && <div className="pt-2 border-t border-teal-50"><p className="text-teal-500 text-xs mb-1">Description</p><p className="text-teal-700">{job.description}</p></div>}
        </div>
      </div>

      {/* Start Job (OTP) */}
      {canStart && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-3 text-sm">Start Job</h3>
          <p className="text-xs text-teal-400 mb-3">Ask the customer for their OTP to start the job</p>
          <div className="flex gap-3">
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 4-digit OTP"
              maxLength={6} className="input flex-1 text-center text-xl font-black tracking-widest" />
            <button onClick={handleStart} disabled={starting || !otp.trim()} className="btn btn-primary px-6">
              {starting ? '⏳' : '▶ Start'}
            </button>
          </div>
        </div>
      )}

      {/* Complete Job */}
      {canComplete && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-3 text-sm">Complete Job</h3>
          <p className="text-xs text-teal-400 mb-3">Upload proof photos of completed work</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => setProofFiles(Array.from(e.target.files || []))} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-teal-200 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50 transition mb-3">
            <p className="text-3xl mb-2">📸</p>
            <p className="text-sm font-semibold text-teal-600">
              {proofFiles.length > 0 ? `${proofFiles.length} photo(s) selected` : 'Tap to upload proof photos'}
            </p>
          </button>
          {proofFiles.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {proofFiles.map((f, i) => (
                <div key={i} className="w-16 h-16 bg-teal-50 rounded-xl overflow-hidden">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <button onClick={handleComplete} disabled={completing || uploading || proofFiles.length === 0}
            className="btn btn-primary w-full">
            {uploading ? '⏳ Uploading...' : completing ? '⏳ Completing...' : '✅ Mark as Complete'}
          </button>
        </div>
      )}

      {job.status === 'completed' && (
        <div className="card p-5 border-l-4 border-green-500 bg-green-50">
          <p className="font-black text-green-700 text-lg">✅ Job Completed!</p>
          <p className="text-sm text-green-600 mt-1">Earnings will be credited to your wallet after escrow release.</p>
        </div>
      )}
    </div>
  );
}
