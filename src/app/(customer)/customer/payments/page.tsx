'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { paymentsApi } from '@/lib/api';
import { Payment } from '@/types';

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  escrow_held: { label: '🔒 In Escrow', cls: 'badge-yellow' },
  released:    { label: '✅ Released',  cls: 'badge-green' },
  refunded:    { label: '↩ Refunded',  cls: 'badge-gray' },
  failed:      { label: '✕ Failed',    cls: 'badge-red' },
  pending:     { label: '⏳ Pending',  cls: 'badge-yellow' },
  captured:    { label: '💳 Captured', cls: 'badge-green' },
  disputed:    { label: '⚖️ Disputed', cls: 'badge-red' },
};

function PaymentCard({ p }: { p: Payment }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[p.status] || { label: p.status, cls: 'badge-gray' };
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full text-left p-5 hover:bg-teal-50/50 transition">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-black text-teal-800 text-lg">₹{Number(p.amount).toLocaleString()}</p>
            <p className="text-xs text-teal-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
            <span className={`text-teal-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </div>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-teal-50">
          <div className="space-y-2 text-sm mt-4">
            <div className="flex justify-between"><span className="text-teal-500">Service Fee</span><span className="font-medium text-teal-800">₹{Number(p.amount).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-teal-500">Platform Fee</span><span className="font-medium text-teal-800">₹{Number(p.platformFee).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-teal-500">Worker Earns</span><span className="font-medium text-teal-800">₹{Number(p.workerAmount).toLocaleString()}</span></div>
            {p.razorpayPaymentId && (
              <div className="flex justify-between pt-2 border-t border-teal-50">
                <span className="text-teal-400 text-xs">Payment ID</span>
                <span className="text-teal-500 font-mono text-xs truncate max-w-[160px]">{p.razorpayPaymentId}</span>
              </div>
            )}
          </div>
          {p.status === 'escrow_held' && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
              🔒 Funds secured in escrow. Release from the job page after work is done.
            </div>
          )}
          <Link href={`/customer/jobs/${p.jobId}`} className="mt-3 block text-center text-xs text-green-600 font-semibold hover:underline">
            View Job →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    paymentsApi.getHistory(page).then((res: any) => {
      setPayments(res.data?.payments || []);
      setTotal(res.data?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const inEscrow = payments.filter(p => p.status === 'escrow_held').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-xl font-black text-teal-800 mb-5">Payment History</h1>

      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-teal-800">₹{totalPaid.toLocaleString()}</p>
            <p className="text-xs text-teal-400 mt-0.5">Total Paid</p>
          </div>
          <div className="card p-4 text-center bg-amber-50">
            <p className="text-2xl font-black text-amber-700">₹{inEscrow.toLocaleString()}</p>
            <p className="text-xs text-amber-500 mt-0.5">🔒 In Escrow</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : payments.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">💳</p>
          <p className="font-black text-teal-800 text-lg mb-2">No payments yet</p>
          <p className="text-teal-400 text-sm">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => <PaymentCard key={p.id} p={p} />)}
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-teal-600">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={payments.length < 10} className="btn btn-ghost btn-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
