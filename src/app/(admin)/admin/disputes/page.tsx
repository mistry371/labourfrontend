'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { Job } from '@/types';

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await adminApi.listDisputes(page);
      setDisputes(res.data?.disputes || []);
      setTotal(res.data?.total || 0);
    } catch (e: any) { toast.error(e?.message || 'Failed to load disputes'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dispute Resolution</h1>
          <p className="text-teal-300/70 text-sm">{total} open dispute{total !== 1 ? 's' : ''}</p>
        </div>
        {total > 0 && (
          <span className="flex items-center gap-1.5 bg-red-500/20 text-red-300 text-sm font-bold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />{total} Pending
          </span>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-4">⚖️</p>
            <p className="font-black text-teal-800 text-lg">No open disputes</p>
            <p className="text-teal-400 text-sm mt-1">All disputes have been resolved</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 border-b border-teal-100">
                <tr>{['Job','Customer','Worker','Amount','Opened','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-teal-600 font-bold whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {disputes.map(job => {
                  const worker = job.assignments?.find(a => ['accepted','active','completed'].includes(a.status))?.worker;
                  const payment = job.payments?.[0];
                  return (
                    <tr key={job.id} className="hover:bg-teal-50/50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-teal-800 truncate max-w-[180px]">{job.title}</p>
                        <p className="text-xs text-teal-400">{job.categoryName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-teal-800">{job.customer?.name ?? '—'}</p>
                        <p className="text-xs text-teal-400">{job.customer?.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-teal-800">{worker?.user?.name ?? '—'}</p>
                        <p className="text-xs text-teal-400">{worker?.user?.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-black text-teal-800">₹{Number(payment?.amount ?? job.estimatedPrice).toLocaleString()}</p>
                        <p className="text-xs text-teal-400 capitalize">{payment?.status ?? 'no payment'}</p>
                      </td>
                      <td className="px-4 py-3 text-teal-400 text-xs">{timeSince(job.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/disputes/${job.id}`}
                          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition font-semibold">
                          Resolve →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
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
