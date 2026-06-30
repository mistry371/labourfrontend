'use client';
import { useEffect, useState } from 'react';
import { workerApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Worker, SERVICE_CATEGORIES } from '@/types';
import { toast } from '@/components/ui/Toast';

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending_kyc:    { label: 'KYC Pending',    cls: 'badge-gray' },
  kyc_submitted:  { label: 'Under Review',   cls: 'badge-yellow' },
  approved:       { label: '✅ Verified',    cls: 'badge-green' },
  rejected:       { label: '✕ Rejected',     cls: 'badge-red' },
  suspended:      { label: '⚠ Suspended',   cls: 'badge-red' },
};

export default function WorkerProfilePage() {
  const { user, logout } = useAuthStore();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    workerApi.getProfile().then((res: any) => {
      setWorker(res.data);
      setForm({ name: res.data?.user?.name || '', email: res.data?.user?.email || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile(form);
      toast.success('Profile updated');
      setEditing(false);
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>;

  const statusCfg = STATUS_CFG[worker?.status || ''] || { label: worker?.status || '', cls: 'badge-gray' };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4 animate-fade-in">
      {/* Profile Hero */}
      <div className="bg-hero rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-green">
            {worker?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-black text-white text-lg">{worker?.user?.name}</p>
            <p className="text-teal-300 text-sm">+91 {worker?.user?.phone}</p>
            <span className={`badge mt-1.5 ${statusCfg.cls}`}>{statusCfg.label}</span>
          </div>
          <button onClick={() => setEditing(!editing)} className="text-sm text-green-300 font-semibold hover:text-white transition">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-4">Edit Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input w-full" />
            </div>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full">
              {saving ? '⏳ Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Performance */}
      {worker && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-4">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Jobs Completed', value: String(worker.totalJobsCompleted), color: 'text-green-600' },
              { label: 'Avg Rating', value: `⭐ ${worker.averageRating?.toFixed(1) || '—'}`, color: 'text-amber-600' },
              { label: 'Acceptance Rate', value: `${worker.acceptanceRate?.toFixed(0) || 0}%`, color: 'text-teal-700' },
              { label: 'Completion Rate', value: `${worker.completionRate?.toFixed(0) || 0}%`, color: 'text-teal-700' },
            ].map(s => (
              <div key={s.label} className="bg-teal-50 rounded-xl p-3 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-teal-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {worker?.skills && worker.skills.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-teal-800 mb-4">Skills</h3>
          <div className="space-y-0">
            {worker.skills.map(skill => {
              const cat = SERVICE_CATEGORIES.find(c => c.id === skill.categoryId);
              return (
                <div key={skill.id} className="flex items-center gap-3 py-3 border-b border-teal-50 last:border-0">
                  <span className="text-2xl">{cat?.icon || '🔧'}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-teal-800 text-sm">{skill.categoryName}</p>
                    {skill.subcategoryName && <p className="text-xs text-teal-400">{skill.subcategoryName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-600">⭐ {skill.skillRating?.toFixed(1)}</p>
                    <p className="text-xs text-teal-400">{skill.jobsCompletedInSkill} jobs</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KYC */}
      <div className="card p-5">
        <h3 className="font-bold text-teal-800 mb-3">KYC & Documents</h3>
        {worker?.status === 'approved' ? (
          <div className="flex items-center gap-2 text-green-600"><span className="text-xl">✅</span><p className="text-sm font-semibold">KYC Verified</p></div>
        ) : worker?.status === 'kyc_submitted' ? (
          <div className="flex items-center gap-2 text-amber-600"><span className="text-xl">⏳</span><p className="text-sm font-semibold">Under Review</p></div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-400"><span className="text-xl">📄</span><p className="text-sm">Not submitted</p></div>
            <a href="/worker/kyc" className="text-sm text-green-600 font-bold hover:text-green-700">Complete KYC →</a>
          </div>
        )}
      </div>

      <button onClick={logout} className="w-full border border-red-200 text-red-500 py-3 rounded-2xl font-semibold hover:bg-red-50 transition">
        Sign Out
      </button>
    </div>
  );
}
