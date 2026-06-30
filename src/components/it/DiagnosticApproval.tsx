'use client';
import { useState } from 'react';
import { DiagnosticReport } from '@/types';
import { jobsApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface DiagnosticApprovalProps {
  jobId: string;
  report: DiagnosticReport;
  onDecision: (approved: boolean) => void;
}

export function DiagnosticApproval({ jobId, report, onDecision }: DiagnosticApprovalProps) {
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      await jobsApi.approvePrice(jobId, true);
      toast.success('Quote approved! Technician will proceed with repair.');
      onDecision(true);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Please provide a reason'); return; }
    setLoading(true);
    try {
      await jobsApi.approvePrice(jobId, false, rejectionReason);
      toast.info('Quote rejected. Diagnostic fee may still apply.');
      onDecision(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 border-2 border-amber-300 animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔍</span>
        <div>
          <h3 className="font-black text-teal-800 text-lg">Diagnostic Complete</h3>
          <p className="text-sm text-teal-500">Review and approve the repair quote</p>
        </div>
      </div>

      {/* Root Cause */}
      <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Root Cause</p>
        <p className="text-sm text-teal-800 font-medium">{report.rootCause}</p>
      </div>

      {/* Recommended Action */}
      <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Recommended Action</p>
        <p className="text-sm text-teal-800">{report.recommendedAction}</p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">Price Breakdown</p>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-teal-600">Diagnostic Fee</span>
            <span className="font-semibold text-teal-800">₹{report.diagnosticFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-teal-600">Labour Cost</span>
            <span className="font-semibold text-teal-800">₹{report.laborCost}</span>
          </div>
          {report.partsRequired.length > 0 && (
            <>
              {report.partsRequired.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-teal-500 pl-2">• {p.name}</span>
                  <span className="text-teal-700">₹{p.estimatedCost}</span>
                </div>
              ))}
            </>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-bold text-teal-800">Total Estimate</span>
            <span className="font-black text-green-600 text-lg">₹{report.totalEstimate}</span>
          </div>
        </div>
      </div>

      {/* Duration + Remote */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-teal-50 rounded-xl p-3 text-center">
          <p className="text-xs text-teal-500">Est. Duration</p>
          <p className="font-bold text-teal-800">{report.estimatedDurationHours}h</p>
        </div>
        {report.canBeRemote && (
          <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-green-600">Can be done</p>
            <p className="font-bold text-green-700">Remotely ✓</p>
          </div>
        )}
      </div>

      {report.notes && (
        <p className="text-xs text-teal-500 bg-gray-50 rounded-xl p-3 mb-4">
          📝 {report.notes}
        </p>
      )}

      {/* Actions */}
      {!rejecting ? (
        <div className="flex gap-3">
          <button onClick={handleApprove} disabled={loading}
            className="btn btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✅ Approve & Proceed'}
          </button>
          <button onClick={() => setRejecting(true)} disabled={loading}
            className="btn btn-ghost flex-1 border border-red-200 text-red-500 hover:bg-red-50">
            ❌ Reject
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Why are you rejecting this quote?"
            rows={2}
            className="input resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleReject} disabled={loading}
              className="btn flex-1 bg-red-500 text-white hover:bg-red-600">
              {loading ? '...' : 'Confirm Reject'}
            </button>
            <button onClick={() => setRejecting(false)}
              className="btn btn-ghost flex-1 border border-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
