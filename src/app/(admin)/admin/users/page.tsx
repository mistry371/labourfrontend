'use client';
import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { User } from '@/types';
import { toast } from '@/components/ui/Toast';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Inactive', value: 'inactive' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green', blocked: 'badge-red',
  inactive: 'badge-gray', pending_verification: 'badge-yellow',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [blockModal, setBlockModal] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await adminApi.listUsers(page, status || undefined);
      setUsers(res.data?.users || []);
      setTotal(res.data?.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async () => {
    if (!blockModal || !blockReason.trim()) return;
    setActing(true);
    try { await adminApi.blockUser(blockModal.id, blockReason); load(); setBlockModal(null); setBlockReason(''); }
    catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setActing(false); }
  };

  const handleUnblock = async (id: string) => {
    setActing(true);
    try { await adminApi.unblockUser(id); load(); }
    catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setActing(false); }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Users</h1>
        <p className="text-teal-300/70 text-sm">{total.toLocaleString()} registered users</p>
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
        ) : users.length === 0 ? (
          <div className="p-12 text-center"><p className="text-4xl mb-3">👥</p><p className="text-teal-400">No users found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 border-b border-teal-100">
                <tr>{['User','Phone','Role','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-teal-600 font-bold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-teal-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-sm font-black text-white shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-teal-800">{u.name}</p>
                          <p className="text-xs text-teal-400">{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-teal-600">{u.phone}</td>
                    <td className="px-4 py-3"><span className="badge badge-gray capitalize">{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[u.status] || 'badge-gray'}`}>{u.status.replace('_',' ')}</span></td>
                    <td className="px-4 py-3 text-teal-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {u.status === 'blocked' ? (
                        <button onClick={() => handleUnblock(u.id)} disabled={acting}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50">Unblock</button>
                      ) : (
                        <button onClick={() => setBlockModal(u)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition">Block</button>
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
          <p className="text-sm text-teal-300/70">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 bg-white/10 text-teal-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white/20 transition">Prev</button>
            <button onClick={() => setPage(p => p+1)} disabled={page*20>=total} className="px-3 py-1.5 bg-white/10 text-teal-200 rounded-lg text-sm disabled:opacity-40 hover:bg-white/20 transition">Next</button>
          </div>
        </div>
      )}

      {blockModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setBlockModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-black text-teal-800 mb-1">Block User</h2>
            <p className="text-teal-500 text-sm mb-4">Block <strong>{blockModal.name}</strong>? They won't be able to access the platform.</p>
            <textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} rows={3}
              placeholder="Reason for blocking..." className="input w-full resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setBlockModal(null)} className="flex-1 btn btn-ghost border border-teal-100">Cancel</button>
              <button onClick={handleBlock} disabled={acting || !blockReason.trim()}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition">
                {acting ? 'Blocking...' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
