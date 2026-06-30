'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { jobsApi, paymentsApi } from '@/lib/api';
import { Job, JOB_STATUS_LABELS, SERVICE_CATEGORIES } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';
import { io } from 'socket.io-client';

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Booking Placed', icon: '📋' },
  { status: 'matching', label: 'Finding Worker', icon: '🔍' },
  { status: 'assigned', label: 'Worker Assigned', icon: '👷' },
  { status: 'worker_enroute', label: 'Worker En Route', icon: '🚗' },
  { status: 'in_progress', label: 'Work In Progress', icon: '⚡' },
  { status: 'completed', label: 'Completed', icon: '✅' },
];

const STATUS_ORDER = ['pending','matching','assigned','worker_enroute','in_progress','completed'];

export default function CustomerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  // Chat & Calling states
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [callingState, setCallingState] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [callDuration, setCallDuration] = useState(0);

  // OTP confirmation state
  const [completionOtp, setCompletionOtp] = useState('');
  const [generatingOtp, setGeneratingOtp] = useState(false);

  useEffect(() => {
    jobsApi.getById(id).then((res: any) => setJob(res.data)).catch(() => toast.error('Failed to load job')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!job || !['assigned', 'worker_enroute', 'in_progress', 'completed'].includes(job.status)) return;

    const s = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: { token: localStorage.getItem('accessToken') }
    });

    s.on('connect', () => {
      console.log('Connected to socket');
    });

    s.on('chat:receive-message', (msg: any) => {
      if (msg.jobId === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    setSocket(s);

    api.get(`/api/v1/chat/messages/${id}`)
      .then((res: any) => setMessages(res.data || []))
      .catch(console.error);

    return () => {
      s.disconnect();
    };
  }, [job, id]);

  useEffect(() => {
    let t: any;
    if (callingState === 'ringing') {
      t = setTimeout(() => setCallingState('connected'), 2500);
    } else if (callingState === 'connected') {
      t = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => {
      clearTimeout(t);
      clearInterval(t);
    };
  }, [callingState]);

  const handleSendMessage = () => {
    if (!msgInput.trim() || !socket) return;
    socket.emit('chat:send-message', { jobId: id, content: msgInput });
    setMsgInput('');
  };

  const handleGenerateCompletionOtp = async () => {
    setGeneratingOtp(true);
    try {
      const res: any = await jobsApi.generateCompletionOtp(id);
      setCompletionOtp(res.data.otp);
      toast.success('Completion OTP generated!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate OTP');
    } finally {
      setGeneratingOtp(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this job?')) return;
    setCancelling(true);
    try {
      await jobsApi.cancel(id, 'Cancelled by customer');
      toast.success('Job cancelled');
      router.push('/customer/jobs');
    } catch (e: any) { toast.error(e?.message || 'Failed to cancel'); }
    finally { setCancelling(false); }
  };

  const handlePay = async () => {
    if (!job) return;
    setPaying(true);
    try {
      const res: any = await paymentsApi.createOrder(job.id);
      const order = res.data;
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        order_id: order.razorpayOrderId,
        name: 'Suvidhaye',
        description: job.title,
        handler: async (response: any) => {
          await paymentsApi.verify({ ...response, jobId: job.id });
          toast.success('Payment successful!');
          jobsApi.getById(id).then((r: any) => setJob(r.data));
        },
      });
      rzp.open();
    } catch (e: any) { toast.error(e?.message || 'Payment failed'); }
    finally { setPaying(false); }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
    </div>
  );

  if (!job) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-5xl mb-4">😕</p>
      <p className="font-black text-teal-800 text-lg">Job not found</p>
      <Link href="/customer/jobs" className="btn btn-primary mt-4">Back to Jobs</Link>
    </div>
  );

  const cat = SERVICE_CATEGORIES.find(c => c.id === job.categoryId);
  const currentStep = STATUS_ORDER.indexOf(job.status);
  const worker = job.assignments?.find(a => ['accepted','active','completed'].includes(a.status))?.worker;
  const payment = job.payments?.[0];
  const canPay = job.status === 'assigned' && !payment;
  const canCancel = ['pending','matching','assigned'].includes(job.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white rounded-xl border border-teal-100 flex items-center justify-center text-teal-600 hover:bg-green-50 transition">←</button>
        <div className="flex-1">
          <h1 className="font-black text-teal-800 text-lg leading-tight">{job.title}</h1>
          <p className="text-xs text-teal-400">#{job.id.slice(0,8).toUpperCase()}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Timeline */}
      {!['cancelled','disputed'].includes(job.status) && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-4 text-sm">Job Progress</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-teal-100" />
            <div className="space-y-4">
              {TIMELINE_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.status} className="flex items-center gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all ${
                      done ? 'bg-brand-green text-white shadow-green' : 'bg-teal-50 text-teal-300'
                    } ${active ? 'ring-4 ring-green-200 animate-pulse-green' : ''}`}>
                      {done ? step.icon : '○'}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${done ? 'text-teal-800' : 'text-teal-300'}`}>{step.label}</p>
                      {active && <p className="text-xs text-green-600 font-medium">Current status</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Job Details */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">{cat?.icon || '🔧'}</div>
          <div>
            <p className="font-bold text-teal-800">{job.categoryName}</p>
            <p className="text-xs text-teal-400">
              {job.itAttributes?.deviceType && `${job.itAttributes.deviceType} • `}
              {job.serviceName && `${job.serviceName} • `}
              {job.itAttributes?.issueType || job.title}
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-teal-500">Address</span><span className="text-teal-800 font-medium text-right max-w-[60%]">{job.jobAddress}</span></div>
          {job.scheduledAt && <div className="flex justify-between"><span className="text-teal-500">Scheduled</span><span className="text-teal-800 font-medium">{new Date(job.scheduledAt).toLocaleString('en-IN')}</span></div>}
          <div className="flex justify-between"><span className="text-teal-500">Booked</span><span className="text-teal-800 font-medium">{new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
        </div>
      </div>

      {/* Worker Info */}
      {worker && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-teal-50 pb-3">
            <h3 className="font-bold text-teal-800 text-sm">Your Worker</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="btn btn-sm btn-outline border-teal-200 text-teal-700 flex items-center gap-1.5"
              >
                💬 Chat
              </button>
              <button
                onClick={() => setCallingState('ringing')}
                className="btn btn-sm btn-primary flex items-center gap-1.5"
              >
                📞 Voice Call
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-teal rounded-full flex items-center justify-center text-white font-black text-lg">
              {worker.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-teal-800">{worker.user?.name}</p>
              <p className="text-xs text-teal-400">⭐ {worker.averageRating?.toFixed(1)} · {worker.totalJobsCompleted} jobs</p>
            </div>
            <a href={`tel:${worker.user?.phone}`} className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-100 transition">📱</a>
          </div>

          {/* Real-time Chat Panel */}
          {chatOpen && (
            <div className="border border-teal-100 rounded-2xl p-4 bg-teal-50/30 flex flex-col h-72">
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {messages.map((m, idx) => {
                  const isMe = m.senderId !== worker.userId;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-2xl px-3 py-1.5 text-sm max-w-[80%] ${
                        isMe ? 'bg-blue-600 text-white' : 'bg-white border border-teal-100 text-teal-800'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border border-teal-200 rounded-xl px-3 py-1.5 text-sm bg-white"
                />
                <button onClick={handleSendMessage} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-bold">Send</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* simulated Calling Overlay */}
      {callingState !== 'idle' && (
        <div className="fixed inset-0 bg-teal-900/90 z-50 flex flex-col items-center justify-center text-white animate-fade-in">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl mb-6 animate-pulse">
            👷
          </div>
          <h2 className="text-2xl font-black">{worker?.user?.name || 'Technician'}</h2>
          <p className="text-teal-300 mt-2 text-sm">
            {callingState === 'ringing' ? '🔔 Ringing...' : 'Connected'}
          </p>
          {callingState === 'connected' && (
            <p className="text-xl font-mono mt-3">{formatTime(callDuration)}</p>
          )}

          <button
            onClick={() => setCallingState('idle')}
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl mt-12 hover:bg-red-700 transition active:scale-95 shadow-lg"
          >
            ❌
          </button>
        </div>
      )}

      {/* Payment */}
      <div className="card p-5">
        <h3 className="font-bold text-teal-800 mb-3 text-sm">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-teal-500">Service Fee</span><span className="text-teal-800">₹{Number(job.estimatedPrice).toLocaleString()}</span></div>
          {job.platformFee && <div className="flex justify-between"><span className="text-teal-500">Platform Fee</span><span className="text-teal-800">₹{Number(job.platformFee).toLocaleString()}</span></div>}
          <div className="border-t border-teal-50 pt-2 flex justify-between font-black">
            <span className="text-teal-800">Total</span>
            <span className="text-green-600 text-lg">₹{Number(job.finalPrice ?? job.estimatedPrice).toLocaleString()}</span>
          </div>
        </div>
        {payment && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`badge ${payment.status === 'released' ? 'badge-green' : payment.status === 'escrow_held' ? 'badge-yellow' : 'badge-gray'}`}>
              {payment.status.replace(/_/g, ' ')}
            </span>
            {payment.razorpayPaymentId && <span className="text-xs text-teal-400 font-mono">{payment.razorpayPaymentId}</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {job.status === 'in_progress' && (
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-teal-800">Job Completion Verification</p>
                <p className="text-xs text-teal-400">Generate completion OTP for the technician</p>
              </div>
              <button
                disabled={generatingOtp}
                onClick={handleGenerateCompletionOtp}
                className="btn btn-sm btn-primary"
              >
                {generatingOtp ? 'Generating...' : '🔑 Generate OTP'}
              </button>
            </div>
            {completionOtp && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Share this Completion OTP</p>
                <p className="text-2xl font-black text-green-700 tracking-widest mt-1">{completionOtp}</p>
              </div>
            )}
          </div>
        )}
        {canPay && (
          <button onClick={handlePay} disabled={paying} className="btn btn-primary w-full">
            {paying ? '⏳ Processing...' : '💳 Pay Now'}
          </button>
        )}
        {job.status === 'completed' && (
          <button
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/jobs/${job.id}/invoice`, '_blank')}
            className="btn btn-primary w-full bg-emerald-600 hover:bg-emerald-700"
          >
            📄 Download Invoice
          </button>
        )}
        {job.status === 'completed' && !job.payments?.some(p => p.status === 'released') && (
          <Link href={`/customer/jobs/${job.id}/review`} className="btn btn-primary w-full text-center block">⭐ Leave a Review</Link>
        )}
        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling}
            className="btn btn-ghost w-full border border-red-200 text-red-500 hover:bg-red-50">
            {cancelling ? 'Cancelling...' : '✕ Cancel Job'}
          </button>
        )}
        {job.status === 'disputed' && (
          <div className="card p-4 border-l-4 border-red-400 bg-red-50">
            <p className="text-sm font-bold text-red-700">⚖️ Dispute in Progress</p>
            <p className="text-xs text-red-500 mt-1">Our team is reviewing this job. We'll contact you shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
