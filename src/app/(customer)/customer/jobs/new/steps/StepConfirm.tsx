'use client';
import { useEffect, useState } from 'react';
import api, { pricingApi } from '@/lib/api';
import { SERVICE_CATEGORIES } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import type { StepProps } from './types';

interface ConfirmProps extends StepProps {
  onSubmit: () => void;
  submitting: boolean;
}

interface PriceBreakdown {
  basePrice: number;
  timeSurcharge: number;
  demandSurcharge: number;
  total: number;
}

export function StepConfirm({ draft, update, onBack, onSubmit, submitting }: ConfirmProps) {
  const [estimating, setEstimating] = useState(false);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [priceError, setPriceError] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res: any = await api.post('/api/v1/coupons/validate', {
        code: couponCode,
        orderValue: breakdown?.basePrice ?? draft.estimatedPrice ?? 0,
      });
      setDiscountAmount(res.data.discount);
      setCouponApplied(true);
      const newTotal = (breakdown?.total ?? draft.estimatedPrice ?? 0) - (res.data?.discount ?? 0);
      update({ estimatedPrice: newTotal });
      toast.success('Coupon applied!');
    } catch (err: any) {
      setCouponError(err?.message || 'Invalid coupon');
    }
  };

  useEffect(() => {
    if (!draft.jobLatitude || !draft.jobLongitude || !draft.categoryId) return;
    setEstimating(true);
    setPriceError(false);

    pricingApi
      .estimate({
        categoryId: draft.categoryId,
        latitude: draft.jobLatitude,
        longitude: draft.jobLongitude,
        scheduledAt: draft.scheduledAt || undefined,
      })
      .then((res: any) => {
        const data = res.data;
        const bd: PriceBreakdown = data.breakdown ?? {
          basePrice: data.estimatedPrice,
          timeSurcharge: 0,
          demandSurcharge: 0,
          total: data.estimatedPrice,
        };
        setBreakdown(bd);
        update({ estimatedPrice: bd.total });
      })
      .catch(() => {
        // Fallback to a default base price
        const fallback = 300;
        setBreakdown({ basePrice: fallback, timeSurcharge: 0, demandSurcharge: 0, total: fallback });
        update({ estimatedPrice: fallback });
        setPriceError(true);
      })
      .finally(() => setEstimating(false));
  }, []);

  const rows: { label: string; value: string }[] = [
    { label: 'Category', value: draft.categoryName ?? '—' },
    ...(draft.serviceName ? [{ label: 'Service', value: draft.serviceName }] : []),
    { label: 'Title', value: draft.title },
    { label: 'Location', value: draft.jobAddress },
    {
      label: 'Schedule',
      value: draft.scheduledAt
        ? new Date(draft.scheduledAt).toLocaleString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit',
          })
        : 'Immediate (ASAP)',
    },
    ...(draft.mediaUrls.length > 0
      ? [{ label: 'Photos', value: `${draft.mediaUrls.length} attached` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Review your booking</h2>
        <p className="text-sm text-gray-500 mt-1">Confirm the details before booking</p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
          <p className="text-white font-semibold text-lg">{draft.title}</p>
          <p className="text-blue-100 text-sm mt-0.5">{draft.categoryName}</p>
        </div>
        <div className="divide-y divide-gray-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between px-5 py-3 gap-4">
              <span className="text-sm text-gray-500 shrink-0">{label}</span>
              <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description preview */}
      <div className="bg-gray-50 rounded-2xl px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
        <p className="text-sm text-gray-700 leading-relaxed">{draft.description}</p>
      </div>

      {/* Photo thumbnails */}
      {draft.mediaUrls.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {draft.mediaUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Price estimate */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-blue-800">Price Estimate</p>
          {estimating && <Spinner size="sm" />}
        </div>

        {estimating ? (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Spinner size="sm" />
            Calculating best price...
          </div>
        ) : breakdown ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-blue-700">
              <span>Base price</span>
              <span>₹{breakdown.basePrice}</span>
            </div>
            {breakdown.timeSurcharge > 0 && (
              <div className="flex justify-between text-sm text-blue-700">
                <span>Time surcharge</span>
                <span>+₹{breakdown.timeSurcharge}</span>
              </div>
            )}
            {breakdown.demandSurcharge > 0 && (
              <div className="flex justify-between text-sm text-blue-700">
                <span>Demand surcharge</span>
                <span>+₹{breakdown.demandSurcharge}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Coupon discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-blue-900 text-lg">
              <span>Total</span>
              <span>₹{breakdown.total - discountAmount}</span>
            </div>
            {priceError && (
              <p className="text-xs text-blue-500 mt-1">Using base estimate — live pricing unavailable</p>
            )}
          </div>
        ) : null}

        {/* Coupon input */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <label className="block text-xs font-bold text-blue-800 mb-1.5">Have a Promo Code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER CODE"
              disabled={couponApplied}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="text-sm flex-1 uppercase py-1.5 px-3 border border-blue-200 rounded-xl bg-white"
            />
            <button
              type="button"
              disabled={couponApplied}
              onClick={handleApplyCoupon}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {couponApplied ? 'Applied' : 'Apply'}
            </button>
          </div>
          {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
        </div>

        <p className="text-xs text-blue-500 mt-3">
          Final price may vary. Payment is collected after job completion.
        </p>
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-400 text-center">
        By booking, you agree to our{' '}
        <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 border border-gray-300 py-3.5 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || estimating}
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Spinner size="sm" /> Booking...</>
          ) : (
            '✓ Confirm Booking'
          )}
        </button>
      </div>
    </div>
  );
}
