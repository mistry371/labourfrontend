'use client';
import { useState } from 'react';
import { jobsApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface Part { name: string; estimatedCost: number; }

interface DiagnosticFormProps {
  jobId: string;
  onSubmitted: () => void;
}

export function DiagnosticForm({ jobId, onSubmitted }: DiagnosticFormProps) {
  const [rootCause, setRootCause] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [parts, setParts] = useState<Part[]>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [diagnosticFee, setDiagnosticFee] = useState('99');
  const [canBeRemote, setCanBeRemote] = useState(false);
  const [durationHours, setDurationHours] = useState('2');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addPart = () => {
    if (!newPartName || !newPartCost) return;
    setParts(p => [...p, { name: newPartName, estimatedCost: Number(newPartCost) }]);
    setNewPartName(''); setNewPartCost('');
  };

  const removePart = (i: number) => setParts(p => p.filter((_, idx) => idx !== i));

  const totalEstimate = Number(diagnosticFee) + Number(laborCost) +
    parts.reduce((s, p) => s + p.estimatedCost, 0);

  const handleSubmit = async () => {
    if (!rootCause || !recommendedAction || !laborCost) {
      toast.error('Fill in all required fields'); return;
    }
    setLoading(true);
    try {
      await jobsApi.submitDiagnostic(jobId, {
        rootCause, recommendedAction, partsRequired: parts,
        laborCost: Number(laborCost), diagnosticFee: Number(diagnosticFee),
        canBeRemote, estimatedDurationHours: Number(durationHours), notes,
      });
      toast.success('Diagnostic submitted! Waiting for customer approval.');
      onSubmitted();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit diagnostic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🔬</span>
        <div>
          <h3 className="font-black text-teal-800">Submit Diagnostic Report</h3>
          <p className="text-sm text-teal-500">Customer will approve before you proceed</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-1">Root Cause *</label>
        <textarea value={rootCause} onChange={e => setRootCause(e.target.value)}
          placeholder="What is causing the issue?" rows={2} className="input resize-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-1">Recommended Action *</label>
        <textarea value={recommendedAction} onChange={e => setRecommendedAction(e.target.value)}
          placeholder="What needs to be done to fix it?" rows={2} className="input resize-none" />
      </div>

      {/* Parts */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-2">Parts Required</label>
        {parts.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 bg-gray-50 rounded-xl px-3 py-2">
            <span className="flex-1 text-sm text-teal-700">{p.name}</span>
            <span className="text-sm font-bold text-teal-800">₹{p.estimatedCost}</span>
            <button onClick={() => removePart(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
          </div>
        ))}
        <div className="flex gap-2">
          <input value={newPartName} onChange={e => setNewPartName(e.target.value)}
            placeholder="Part name" className="input flex-1 text-sm" />
          <input value={newPartCost} onChange={e => setNewPartCost(e.target.value)}
            type="number" placeholder="₹ Cost" className="input w-24 text-sm" />
          <button onClick={addPart} className="btn btn-secondary btn-sm px-3">+ Add</button>
        </div>
      </div>

      {/* Costs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-teal-700 mb-1">Labour Cost (₹) *</label>
          <input value={laborCost} onChange={e => setLaborCost(e.target.value)}
            type="number" placeholder="0" className="input" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-teal-700 mb-1">Diagnostic Fee (₹)</label>
          <input value={diagnosticFee} onChange={e => setDiagnosticFee(e.target.value)}
            type="number" placeholder="99" className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-teal-700 mb-1">Est. Duration (hrs)</label>
          <input value={durationHours} onChange={e => setDurationHours(e.target.value)}
            type="number" step="0.5" placeholder="2" className="input" />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={canBeRemote} onChange={e => setCanBeRemote(e.target.checked)}
              className="w-4 h-4 accent-teal-600" />
            <span className="text-sm font-medium text-teal-700">Can fix remotely</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-1">Additional Notes</label>
        <input value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Any other info for the customer..." className="input" />
      </div>

      {/* Total */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
        <div className="flex justify-between items-center">
          <span className="font-bold text-teal-700">Total Estimate</span>
          <span className="font-black text-green-600 text-xl">₹{totalEstimate}</span>
        </div>
        <p className="text-xs text-teal-400 mt-1">Customer must approve this before you proceed</p>
      </div>

      <button onClick={handleSubmit} disabled={loading} className="btn btn-primary w-full btn-lg">
        {loading
          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : '📤 Submit Diagnostic Report'}
      </button>
    </div>
  );
}
