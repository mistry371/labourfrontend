'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then((r: any) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600', link: '/admin/users' },
    { label: 'Total Workers', value: stats?.totalWorkers || 0, icon: '👷', color: 'from-teal-500 to-teal-700', link: '/admin/workers' },
    { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: '📋', color: 'from-green-500 to-green-700', link: '/admin/jobs' },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-amber-500 to-orange-600', link: '/admin/analytics' },
    { label: 'Active Jobs', value: stats?.activeJobs || 0, icon: '⚡', color: 'from-indigo-500 to-purple-600', link: '/admin/jobs' },
    { label: 'Disputes', value: stats?.openDisputes || 0, icon: '⚖️', color: 'from-red-500 to-rose-600', link: '/admin/disputes' },
    { label: 'KYC Pending', value: stats?.kycPending || 0, icon: '🪪', color: 'from-orange-500 to-amber-600', link: '/admin/workers' },
    { label: 'Completed Today', value: stats?.completedToday || 0, icon: '✅', color: 'from-emerald-500 to-green-600', link: '/admin/jobs' },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
        <p className="text-teal-300/70 text-sm">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <Link key={c.label} href={c.link}
            className={`rounded-2xl p-5 group animate-slide-up anim-delay-${(i%4+1)*100} cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-300`}
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className={`w-12 h-12 bg-gradient-to-br ${c.color} rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
              {c.icon}
            </div>
            {loading ? (
              <div className="skeleton h-7 w-20 rounded mb-1" />
            ) : (
              <div className="text-2xl font-black text-white">{c.value}</div>
            )}
            <div className="text-sm text-teal-300/70 font-medium">{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">⚡ Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: '/admin/workers', label: 'Review KYC Applications', icon: '🪪', badge: stats?.kycPending },
              { href: '/admin/disputes', label: 'Resolve Disputes', icon: '⚖️', badge: stats?.openDisputes },
              { href: '/admin/pricing', label: 'Update Pricing Rules', icon: '💰' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group">
                <span className="text-xl">{a.icon}</span>
                <span className="text-sm font-medium text-teal-200 flex-1">{a.label}</span>
                {a.badge ? <span className="badge badge-red">{a.badge}</span> : null}
                <span className="text-teal-400 group-hover:text-green-400 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">📊 Platform Health</h3>
          <div className="space-y-3">
            {[
              { label: 'Job Success Rate', value: 94, color: 'bg-green-500' },
              { label: 'Worker Utilization', value: 78, color: 'bg-teal-500' },
              { label: 'Customer Satisfaction', value: 96, color: 'bg-blue-500' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-teal-300 font-medium">{m.label}</span>
                  <span className="font-bold text-white">{m.value}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div className={`h-2 ${m.color} rounded-full transition-all duration-1000`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">🔔 Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: 'New worker KYC submitted', time: '2m ago', icon: '🪪' },
              { text: 'Dispute raised on Job #4821', time: '15m ago', icon: '⚖️' },
              { text: 'Payment of ₹1,200 released', time: '1h ago', icon: '💰' },
              { text: '47 jobs completed today', time: '2h ago', icon: '✅' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-teal-200 leading-tight">{a.text}</p>
                  <p className="text-xs text-teal-400/60">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
