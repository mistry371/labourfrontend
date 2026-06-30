'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Worker } from '@/types';
import { toast } from '@/components/ui/Toast';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'KYC Pending', value: 'pending_kyc' },
  { label: 'KYC Submitted', value: 'kyc_submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
] as const;

const STATUS_COLORS: Record<string, string> = {
  pending_kyc: 'badge-gray', kyc_submitted: 'badge-yellow',
  approved: 'badge-green', rejected: 'badge-red', suspended: 'badge-red',
};

function KycModal({ worker, onClose, onApprove, onReject }: { worker: Worker; onClose: () => void; onApprove: (id: string) => Promise<void>; onReject: (id: string, reason: string) => Promise<void> }) {
  const [reason, setReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const docs = [
    { label: 'Aadhaar Front', url: worker.aadhaarFrontUrl },
    { label: 'Aadhaar Back', url: worker.aadhaarBackUrl },
    { label: 'PAN Card', url: worker.panCardUrl },
    { label: 'Selfie', url: worker.selfieUrl },
  ].filter(d => !!d.url);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-black text-teal-800">KYC Review — {worker.user?.name}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 hover:bg-teal-100 transition">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {docs.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {docs.map(doc => (
                <div key={doc.label}>
                  <p className="text-xs text-teal-500 mb-1 font-semibold">{doc.label}</p>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <img src={doc.url} alt={doc.label} className="w-full h-32 object-cover rounded-xl border hover:opacity-90 transition" />
                  </a>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-teal-400 text-center py-4">No documents uploaded</p>}

          <div className="bg-teal-50 rounded-xl p-4 space-y-2 text-sm">
            {[['Aadhaar', worker.aadhaarNumber], ['PAN', worker.panNumber], ['Bank Account', worker.bankAccountNumber], ['IFSC', worker.bankIfsc], ['Account Name', worker.bankAccountName]].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="text-teal-500 shrink-0">{l}</span>
                <span className="font-mono text-teal-800 truncate">{v || '—'}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-teal-700 mb-1.5">Rejection Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Required if rejecting..." className="input w-full resize-none" />
          </div>

          <div className="flex gap-3">
            <button onClick={async () => { setApproving(true); await onApprove(worker.id); setApproving(false); }}
              disabled={approving || rejecting}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50">
              {approving ? '⏳ Approving...' : '✓ Approve KYC'}
            </button>
            <button onClick={async () => { if (!reason.trim()) return toast.error('Enter rejection reason'); setRejecting(true); await onReject(worker.id, reason); setRejecting(false); }}
              disabled={approving || rejecting || !reason.trim()}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50">
              {rejecting ? '⏳ Rejecting...' : '✕ Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkersPageInner() {
  const searchParams = useSearchParams();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Worker | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = status === 'kyc_submitted'
        ? await adminApi.listPendingKyc(page)
        : await adminApi.listWorkers(page, status || undefined);
      setWorkers(res.data?.workers ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (e: any) { toast.error(e?.message || 'Failed to load workers'); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    try { await adminApi.approveKyc(id); toast.success('KYC approved'); setSelected(null); load(); }
    catch (e: any) { toast.error(e?.message || 'Failed'); }
  };
  const handleReject = async (id: string, reason: string) => {
    try { await adminApi.rejectKyc(id, reason); toast.success('KYC rejected'); setSelected(null); load(); }
    catch (e: any) { toast.error(e?.message || 'Failed'); }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Workers</h1>
        <p className="text-teal-300/70 text-sm">{total.toLocaleString()} workers registered</p>
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
        ) : workers.length === 0 ? (
          <div className="p-12 text-center"><p className="text-4xl mb-3">🔍</p><p className="text-teal-400">No workers found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 border-b border-teal-100">
                <tr>{['Worker','Phone','Status','Rating','Jobs','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-teal-600 font-bold whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {workers.map(w => (
                  <tr key={w.id} className="hover:bg-teal-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-sm font-black text-white shrink-0">
                          {w.user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-teal-800">{w.user?.name}</p>
                          <p className="text-xs text-teal-400 font-mono">{w.id.slice(0,8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-teal-600">{w.user?.phone}</td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[w.status] || 'badge-gray'}`}>{w.status.replace(/_/g,' ')}</span></td>
                    <td className="px-4 py-3 text-amber-600 font-semibold">⭐ {w.averageRating ? Number(w.averageRating).toFixed(1) : '—'}</td>
                    <td className="px-4 py-3 text-teal-700 font-semibold">{w.totalJobsCompleted}</td>
                    <td className="px-4 py-3 text-teal-400">{new Date(w.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {w.status === 'kyc_submitted' && (
                        <button onClick={() => setSelected(w)} className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition">Review KYC</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-teal-300/70">Showing {((page-1)*20+1)}–{Math.min(page*20,total)} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 bg-white/10 text-teal-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white/20 transition">Prev</button>
            <span className="px-3 py-1.5 text-sm text-teal-300">{page} / {Math.ceil(total/20)}</span>
            <button onClick={() => setPage(p => p+1)} disabled={workers.length<20} className="px-3 py-1.5 bg-white/10 text-teal-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white/20 transition">Next</button>
          </div>
        </div>
      )}

      {selected && <KycModal worker={selected} onClose={() => setSelected(null)} onApprove={handleApprove} onReject={handleReject} />}
    </div>
  );
}

export default function AdminWorkersPage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>}>
      <WorkersPageInner />
    </Suspense>
  );
}
