'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from '@/components/ui/Toast';

export default function CorporateDashboard() {
  const [stats, setStats] = useState({
    totalBilled: 0,
    outstandingBalance: 0,
    creditLimit: 100000,
    jobsCompleted: 0,
  });

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/jobs/my')
      .then((res: any) => {
        const jobs = res.data?.jobs || [];
        const completed = jobs.filter((j: any) => j.status === 'completed');
        const billed = completed.reduce((sum: number, j: any) => sum + Number(j.finalPrice || j.estimatedPrice), 0);
        
        setStats({
          totalBilled: billed,
          outstandingBalance: billed * 0.18,
          creditLimit: 100000,
          jobsCompleted: completed.length,
        });

        setInvoices(jobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          date: new Date(j.createdAt).toLocaleDateString(),
          amount: Number(j.finalPrice || j.estimatedPrice),
          status: j.status,
        })));
      })
      .catch(() => toast.error('Failed to load corporate info'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-teal-50 pb-4">
        <div>
          <h1 className="text-2xl font-black text-teal-800">Corporate Billing Center</h1>
          <p className="text-sm text-teal-400">Manage bulk bookings, billing limits, and invoice settlements</p>
        </div>
        <Link href="/customer/jobs/new?type=corporate" className="btn btn-primary">
          💼 Bulk IT Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Outstanding Balance', value: `₹${stats.outstandingBalance.toLocaleString()}`, color: 'text-rose-600', icon: '💳' },
          { label: 'Credit Limit Available', value: `₹${(stats.creditLimit - stats.outstandingBalance).toLocaleString()}`, color: 'text-teal-600', icon: '🛡️' },
          { label: 'Total Corporate Spend', value: `₹${stats.totalBilled.toLocaleString()}`, color: 'text-blue-600', icon: '📈' },
          { label: 'Bulk Jobs Completed', value: stats.jobsCompleted, color: 'text-emerald-600', icon: '✅' },
        ].map((s) => (
          <div key={s.label} className="card p-5 space-y-2">
            <div className="text-2xl">{s.icon}</div>
            <p className="text-xs text-teal-400 font-medium">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-teal-800 mb-4">Invoice Ledger History</h2>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-teal-50 rounded-xl" />)}
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-teal-400 text-center py-6">No billing transactions recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-teal-50 text-teal-500 font-semibold">
                  <th className="py-2.5">Job Detail</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-teal-50/50 hover:bg-teal-50/10">
                    <td className="py-3">
                      <span className="font-bold text-teal-800">{inv.title}</span>
                      <br />
                      <span className="text-xs text-teal-400 font-mono">#{inv.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="py-3 text-teal-600">{inv.date}</td>
                    <td className="py-3">
                      <span className={`badge ${
                        inv.status === 'completed' ? 'badge-green' : inv.status === 'cancelled' ? 'badge-gray' : 'badge-yellow'
                      }`}>{inv.status}</span>
                    </td>
                    <td className="py-3 text-right font-semibold text-teal-800">₹{inv.amount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/jobs/${inv.id}/invoice`, '_blank')}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Print Invoice 📄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
