'use client';
import { useState } from 'react';
import { Payment } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { useRazorpay, PaymentState } from '@/hooks/useRazorpay';

interface Props {
  jobId: string;
  jobTitle: string;
  estimatedPrice: number;
  platformFeePercent?: number;
  payment?: Payment | null;
  onPaymentSuccess: () => void;
}

const PLATFORM_FEE_PERCENT = 15;

function BreakdownRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-gray-900' : 'text-gray-800'}>{value}</span>
    </div>
  );
}

const STATE_LABELS: Partial<Record<PaymentState, string>> = {
  creating_order: 'Creating order…',
  awaiting_payment: 'Opening payment…',
  verifying: 'Verifying payment…',
  retrying: 'Retrying…',
};

export function PaymentSheet({
  jobId,
  jobTitle,
  estimatedPrice,
  platformFeePercent = PLATFORM_FEE_PERCENT,
  payment,
  onPaymentSuccess,
}: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const platformFee = payment
    ? Number(payment.platformFee)
    : Math.round((estimatedPrice * platformFeePercent) / 100);
  const workerAmount = payment
    ? Number(payment.workerAmount)
    : estimatedPrice - platformFee;
  const total = payment ? Number(payment.amount) : estimatedPrice;

  const { state, error, canRetry, isLoading, initiatePayment, retry, reset } = useRazorpay({
    onSuccess: () => onPaymentSuccess(),
  });

  // Already paid — show escrow/release status
  if (payment) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Payment</h2>
            <EscrowBadge status={payment.status} />
          </div>
          <button
            onClick={() => setShowBreakdown((v) => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showBreakdown ? 'Hide breakdown' : 'View breakdown'}
          </button>
        </div>

        {showBreakdown && (
          <div className="px-5 pb-4 space-y-2 border-t border-gray-50 pt-3">
            <BreakdownRow label="Service cost" value={`₹${total.toLocaleString()}`} />
            <BreakdownRow label="Platform fee" value={`₹${platformFee.toLocaleString()}`} />
            <BreakdownRow label="Worker earns" value={`₹${workerAmount.toLocaleString()}`} />
            <div className="border-t border-gray-100 pt-2">
              <BreakdownRow label="Total paid" value={`₹${total.toLocaleString()}`} bold />
            </div>
          </div>
        )}

        <EscrowInfo status={payment.status} releasedAt={payment.escrowReleasedAt} />
      </div>
    );
  }

  // Not yet paid
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Payment Summary</h2>
          <button
            onClick={() => setShowBreakdown((v) => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showBreakdown ? 'Hide' : 'Details'}
          </button>
        </div>

        {showBreakdown && (
          <div className="space-y-2 bg-gray-50 rounded-xl p-3">
            <BreakdownRow label="Service cost" value={`₹${total.toLocaleString()}`} />
            <BreakdownRow
              label={`Platform fee (${platformFeePercent}%)`}
              value={`₹${platformFee.toLocaleString()}`}
            />
            <BreakdownRow label="Worker earns" value={`₹${workerAmount.toLocaleString()}`} />
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
        </div>

        {/* Escrow trust badge */}
        <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-xs font-semibold text-blue-800">Secured by Escrow</p>
            <p className="text-xs text-blue-600">Payment released only after job completion</p>
          </div>
        </div>

        {/* Error state */}
        {state === 'failed' && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
            <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-700 font-medium">Payment failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-red-600 text-xs shrink-0">✕</button>
          </div>
        )}

        {/* CTA */}
        {state === 'failed' ? (
          <div className="flex gap-2">
            {canRetry && (
              <button
                onClick={() => retry(jobId, jobTitle)}
                className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
              >
                🔄 Retry Payment
              </button>
            )}
            <button
              onClick={reset}
              className="flex-1 border border-gray-300 text-gray-700 py-3.5 rounded-2xl font-semibold hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => initiatePayment(jobId, jobTitle)}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-2 text-base shadow-sm"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <span>{STATE_LABELS[state] ?? 'Processing…'}</span>
              </>
            ) : (
              <>
                <span>💳</span>
                <span>Pay ₹{total.toLocaleString()} — Secure Escrow</span>
              </>
            )}
          </button>
        )}

        <p className="text-center text-xs text-gray-400">
          Powered by Razorpay · 256-bit SSL encrypted
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function EscrowBadge({ status }: { status: string }) {
  if (status === 'escrow_held') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
        🔒 In Escrow
      </span>
    );
  }
  if (status === 'released') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
        ✅ Released
      </span>
    );
  }
  if (status === 'refunded') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
        ↩ Refunded
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
        ✕ Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full capitalize">
      {status}
    </span>
  );
}

function EscrowInfo({ status, releasedAt }: { status: string; releasedAt?: string }) {
  if (status === 'escrow_held') {
    return (
      <div className="mx-5 mb-5 flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
        <span className="text-lg shrink-0">🔒</span>
        <div>
          <p className="text-xs font-semibold text-blue-800">Payment secured</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Funds are held safely. Release payment once the job is completed to your satisfaction.
          </p>
        </div>
      </div>
    );
  }
  if (status === 'released') {
    return (
      <div className="mx-5 mb-5 flex items-start gap-2 bg-green-50 rounded-xl px-3 py-2.5">
        <span className="text-lg shrink-0">✅</span>
        <div>
          <p className="text-xs font-semibold text-green-800">Released after completion</p>
          {releasedAt && (
            <p className="text-xs text-green-600 mt-0.5">
              {new Date(releasedAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>
    );
  }
  if (status === 'refunded') {
    return (
      <div className="mx-5 mb-5 flex items-start gap-2 bg-orange-50 rounded-xl px-3 py-2.5">
        <span className="text-lg shrink-0">↩</span>
        <div>
          <p className="text-xs font-semibold text-orange-800">Payment refunded</p>
          <p className="text-xs text-orange-600 mt-0.5">Refund will reflect in 5–7 business days.</p>
        </div>
      </div>
    );
  }
  return null;
}
