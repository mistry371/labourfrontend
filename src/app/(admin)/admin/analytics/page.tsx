'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface RevenuePoint { date: string; revenue: string; platformFee: string; transactions: string; }

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApi.getRevenue(days), adminApi.getDashboard()]).then(([revRes, statsRes]: any[]) => {
      setData(revRes.data || []);
      setStats(statsRes.data);
    }).finally(() => setLoading(false));
  }, [days]);

  const totalRevenue = data.reduce((s, d) => s + parseFloat(d.revenue || '0'), 0);
  const totalFees = data.reduce((s, d) => s + parseFloat(d.platformFee || '0'), 0);
  const totalTx = data.reduce((s, d) => s + parseInt(d.transactions || '0'), 0);
  const maxRevenue = Math.max(...data.map(d => parseFloat(d.revenue || '0')), 1);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-teal-300/70 text-sm">Platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${days === d ? 'bg-brand-green text-white shadow-green' : 'bg-white/10 text-teal-200 hover:bg-white/20'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '💰', color: 'text-green-600' },
          { label: 'Platform Fees', value: `₹${totalFees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '🏦', color: 'text-teal-700' },
          { label: 'Transactions', value: totalTx.toLocaleString(), icon: '📊', color: 'text-teal-700' },
          { label: 'Total Workers', value: stats?.totalWorkers?.toLocaleString() ?? '—', icon: '👷', color: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className="card p-5">
            <p className="text-2xl mb-2">{c.icon}</p>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-sm text-teal-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <h2 className="font-black text-teal-800 mb-6">Revenue Over Time</h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full" /></div>
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-teal-400">No revenue data yet</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-48 min-w-max">
              {data.map((d, i) => {
                const rev = parseFloat(d.revenue || '0');
                const fee = parseFloat(d.platformFee || '0');
                const height = (rev / maxRevenue) * 100;
                const feeH = (fee / maxRevenue) * 100;
                const date = new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                return (
                  <div key={i} className="flex flex-col items-center gap-1 w-10 group relative">
                    <div className="absolute bottom-full mb-2 bg-teal-800 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                      <p>₹{Math.round(rev).toLocaleString()}</p>
                      <p className="text-teal-300">Fee: ₹{Math.round(fee).toLocaleString()}</p>
                    </div>
                    <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                      <div className="w-full bg-green-200 rounded-t-sm" style={{ height: `${Math.max(feeH, 2)}%` }} />
                      <div className="w-full bg-brand-green rounded-t-sm" style={{ height: `${Math.max(height - feeH, 2)}%` }} />
                    </div>
                    <span className="text-xs text-teal-400 rotate-45 origin-left mt-1">{date}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-teal-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-brand-green rounded" /> Revenue</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-200 rounded" /> Platform Fee</div>
            </div>
          </div>
        )}
      </div>

      {/* Daily Table */}
      {data.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-teal-50">
            <h2 className="font-black text-teal-800">Daily Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 border-b border-teal-100">
                <tr>{['Date','Revenue','Platform Fee','Transactions'].map(h => (
                  <th key={h} className={`px-4 py-3 text-teal-600 font-bold ${h === 'Date' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {[...data].reverse().map((d, i) => (
                  <tr key={i} className="hover:bg-teal-50/50 transition">
                    <td className="px-4 py-3 text-teal-700">{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-3 text-right font-black text-teal-800">₹{parseFloat(d.revenue || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">₹{parseFloat(d.platformFee || '0').toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 text-right text-teal-500">{d.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
