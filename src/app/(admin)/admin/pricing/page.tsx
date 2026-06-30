'use client';
import { useEffect, useState, useCallback } from 'react';
import { pricingApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface PricingRule {
  id: string; categoryId: string; categoryName: string;
  basePrice: number; minPrice: number; surgeEnabled: boolean;
  maxSurgeFactor: number; isActive: boolean; updatedAt: string;
}

const CAT_ICONS: Record<string, string> = {
  laptop_repair: '💻', cctv_setup: '📷', networking: '🌐',
  server_setup: '🗄️', data_recovery: '💾', printer_repair: '🖨️',
};

function RuleModal({ rule, onSave, onClose }: { rule: PricingRule; onSave: (r: PricingRule) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({ ...rule });
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<PricingRule>) => setForm(f => ({ ...f, ...p }));

  const handleSave = async () => {
    if (form.basePrice <= 0) return toast.error('Base price must be > 0');
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { /* error handled in parent */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{CAT_ICONS[form.categoryId] || '🔧'}</span>
            <h2 className="font-black text-teal-800">{form.categoryName}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 hover:bg-teal-100 transition">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1.5">Base Price (₹)</label>
              <input type="number" min={0} value={form.basePrice} onChange={e => set({ basePrice: parseFloat(e.target.value) || 0 })} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1.5">Min Price Floor (₹)</label>
              <input type="number" min={0} value={form.minPrice} onChange={e => set({ minPrice: parseFloat(e.target.value) || 0 })} className="input w-full" />
            </div>
          </div>

          <div className="bg-teal-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-teal-800">Surge Pricing</p>
                <p className="text-xs text-teal-400">Auto-increase during high demand</p>
              </div>
              <button onClick={() => set({ surgeEnabled: !form.surgeEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.surgeEnabled ? 'bg-amber-500' : 'bg-teal-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${form.surgeEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {form.surgeEnabled && (
              <div>
                <label className="block text-xs text-teal-600 mb-1">Max surge: <span className="font-black text-teal-800">{form.maxSurgeFactor}×</span> (max ₹{Math.round(form.basePrice * form.maxSurgeFactor).toLocaleString()})</label>
                <input type="range" min={1.0} max={5.0} step={0.1} value={form.maxSurgeFactor}
                  onChange={e => set({ maxSurgeFactor: parseFloat(e.target.value) })} className="w-full accent-amber-500" />
                <div className="flex justify-between text-xs text-teal-400 mt-0.5"><span>1×</span><span>2×</span><span>3×</span><span>4×</span><span>5×</span></div>
              </div>
            )}
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs font-bold text-green-700 mb-2">Price Preview</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-lg font-black text-teal-800">₹{form.basePrice.toLocaleString()}</p><p className="text-xs text-teal-400">Base</p></div>
              <div><p className="text-lg font-black text-teal-800">₹{form.minPrice.toLocaleString()}</p><p className="text-xs text-teal-400">Floor</p></div>
              <div><p className="text-lg font-black text-amber-600">₹{Math.round(form.basePrice * form.maxSurgeFactor).toLocaleString()}</p><p className="text-xs text-teal-400">Max Surge</p></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn btn-ghost border border-teal-100">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn btn-primary">
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PricingRule | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await pricingApi.getRules();
      setRules(res.data || []);
    } catch { toast.error('Failed to load pricing rules'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (updated: PricingRule) => {
    try {
      await pricingApi.upsertRule(updated);
      toast.success(`${updated.categoryName} pricing saved`);
      load();
    } catch (e: any) { toast.error(e?.message || 'Failed to save'); throw e; }
  };

  const toggleActive = async (rule: PricingRule) => {
    try {
      await pricingApi.updateRule(rule.id, { isActive: !rule.isActive });
      toast.success(`${rule.categoryName} ${rule.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  const activeCount = rules.filter(r => r.isActive).length;
  const surgeCount = rules.filter(r => r.surgeEnabled && r.isActive).length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Pricing Engine</h1>
          <p className="text-teal-300/70 text-sm">{activeCount} active · {surgeCount} with surge</p>
        </div>
      </div>

      {/* Summary */}
      {!loading && rules.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Categories', value: rules.length, color: 'text-teal-800' },
            { label: 'Active', value: activeCount, color: 'text-green-600' },
            { label: 'Surge On', value: surgeCount, color: 'text-amber-600' },
            { label: 'Avg Base', value: `₹${Math.round(rules.reduce((s,r) => s + Number(r.basePrice), 0) / rules.length).toLocaleString()}`, color: 'text-teal-700' },
          ].map(c => (
            <div key={c.label} className="card p-4 text-center">
              <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
              <p className="text-xs text-teal-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className={`card overflow-hidden transition ${!rule.isActive ? 'opacity-60' : ''}`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CAT_ICONS[rule.categoryId] || '🔧'}</span>
                    <div>
                      <p className="font-black text-teal-800">{rule.categoryName}</p>
                      <p className="text-xs text-teal-400 font-mono">{rule.categoryId}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(rule)}
                    className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${rule.isActive ? 'bg-green-500' : 'bg-teal-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${rule.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <p className="text-3xl font-black text-teal-800 mb-3">₹{Number(rule.basePrice).toLocaleString()}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="badge badge-gray">Floor ₹{Number(rule.minPrice).toLocaleString()}</span>
                  {rule.surgeEnabled ? (
                    <span className="badge badge-yellow">⚡ Surge {rule.maxSurgeFactor}×</span>
                  ) : (
                    <span className="badge badge-gray">No surge</span>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-teal-50 flex items-center justify-between">
                <p className="text-xs text-teal-400">Updated {new Date(rule.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                <button onClick={() => setEditing(rule)} className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition font-semibold">Edit →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <RuleModal rule={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
