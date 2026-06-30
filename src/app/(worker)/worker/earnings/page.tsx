'use client';
import { useState, useEffect, useCallback } from 'react';
import { walletApi, workerApi } from '@/lib/api';
import { Wallet, WalletLog } from '@/types';
import { toast } from '@/components/ui/Toast';

const LOG_ICONS: Record<string, string> = {
  credit: '⬆️', debit: '⬇️', escrow_hold: '🔒',
  escrow_release: '🔓', withdrawal: '🏦', refund: '↩️', penalty: '⚠️', bonus: '🎁',
};
const CREDIT_TYPES = new Set(['credit', 'escrow_release', 'refund', 'bonus']);

export default function EarningsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [logs, setLogs] = useState<WalletLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'transactions' | 'jobs' | 'withdraw'>('transactions');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [walletRes, logsRes, statsRes]: any[] = await Promise.all([
        walletApi.getBalance(), walletApi.getLogs(1), workerApi.getEarnings(),
      ]);
      setWallet(walletRes.data);
      setLogs(logsRes.data?.logs || []);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load earnings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 100) return toast.error('Minimum withdrawal is ₹100');
    if (wallet && amount > Number(wallet.balance)) return toast.error('Insufficient balance');
    setWithdrawing(true);
    try {
      await walletApi.requestWithdrawal(amount);
      toast.success('Withdrawal requested!');
      setWithdrawAmount('');
      fetchAll();
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setWithdrawing(false); }
  };

  const balance = Number(wallet?.balance ?? 0);
  const totalEarned = Number(wallet?.totalEarned ?? 0);

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4 animate-fade-in">
      {/* Wallet Hero */}
      <div className="bg-hero rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-blob" />
        <div className="relative z-10">
          <p className="text-teal-300/70 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-black text-white mb-5">₹{balance.toLocaleString()}</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}` },
              { label: 'Withdrawn', value: `₹${Number(wallet?.totalWithdrawn ?? 0).toLocaleString()}` },
              { label: 'Jobs Done', value: String(stats?.totalJobsCompleted ?? 0) },
            ].map(s => (
              <div key={s.label}>
                <p className="text-teal-300/70 text-xs">{s.label}</p>
                <p className="font-bold text-white text-sm">{s.value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setTab('withdraw')} disabled={balance < 100}
            className="w-full bg-brand-green text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition shadow-green">
            🏦 Withdraw Funds
          </button>
        </div>
      </div>

      {/* Period Stats */}
      {stats?.periods && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Today', value: `₹${stats.periods.today?.toLocaleString() || 0}` },
            { label: 'This Week', value: `₹${stats.periods.week?.toLocaleString() || 0}` },
            { label: 'This Month', value: `₹${stats.periods.month?.toLocaleString() || 0}` },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="font-black text-teal-800 text-lg">{s.value}</p>
              <p className="text-xs text-teal-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-teal-50 rounded-xl p-1">
        {[['transactions','Transactions'],['jobs','Jobs'],['withdraw','Withdraw']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === v ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {tab === 'transactions' && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-4">Recent Transactions</h3>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-teal-400 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {logs.map(log => {
                const isCredit = CREDIT_TYPES.has(log.type);
                return (
                  <div key={log.id} className="flex items-center gap-3 py-3 border-b border-teal-50 last:border-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
                      {LOG_ICONS[log.type] ?? '💰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-teal-800 truncate">{log.description || log.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-teal-400">{new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`font-black text-sm shrink-0 ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                      {isCredit ? '+' : '-'}₹{Number(log.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Jobs */}
      {tab === 'jobs' && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-4">Completed Jobs</h3>
          {!stats?.completedJobs?.length ? (
            <div className="text-center py-8"><p className="text-4xl mb-3">📋</p><p className="text-teal-400 text-sm">No completed jobs yet</p></div>
          ) : (
            <div className="space-y-0">
              {stats.completedJobs.map((job: any) => (
                <div key={job.id} className="flex items-center gap-3 py-3 border-b border-teal-50 last:border-0">
                  <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-base shrink-0">🔧</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-teal-800 truncate">{job.title}</p>
                    <p className="text-xs text-teal-400">{new Date(job.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className="font-black text-green-600 text-sm">+₹{job.earnings?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdraw */}
      {tab === 'withdraw' && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-4">Withdraw Funds</h3>
          <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-green-600">Available</p>
              <p className="text-2xl font-black text-green-700">₹{balance.toLocaleString()}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-teal-700 mb-1.5">Amount (min ₹100)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 font-bold">₹</span>
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="0" min={100} max={balance} className="input w-full pl-7 text-lg font-black" />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[500,1000,2000,5000].filter(v => v <= balance).map(v => (
                <button key={v} onClick={() => setWithdrawAmount(String(v))}
                  className="text-xs px-3 py-1.5 rounded-full border border-green-200 text-green-600 hover:bg-green-50 transition">
                  ₹{v.toLocaleString()}
                </button>
              ))}
              {balance >= 100 && <button onClick={() => setWithdrawAmount(String(Math.floor(balance)))}
                className="text-xs px-3 py-1.5 rounded-full border border-green-200 text-green-600 hover:bg-green-50 transition">Max</button>}
            </div>
          </div>
          <div className="bg-teal-50 rounded-xl p-3 text-xs text-teal-500 mb-4 space-y-1">
            <p>• Processed within 24 hours to your bank account</p>
            <p>• Minimum withdrawal: ₹100 · No fees</p>
          </div>
          <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 100}
            className="btn btn-primary w-full">
            {withdrawing ? '⏳ Processing...' : '🏦 Request Withdrawal'}
          </button>
        </div>
      )}
    </div>
  );
}
