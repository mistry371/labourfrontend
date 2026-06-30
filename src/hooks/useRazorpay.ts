'use client';
import { useState, useCallback } from 'react';
import { paymentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export type PaymentState =
  | 'idle'
  | 'creating_order'
  | 'awaiting_payment'
  | 'verifying'
  | 'success'
  | 'failed'
  | 'retrying';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

interface UseRazorpayOptions {
  onSuccess?: (result: PaymentResult) => void;
  onFailure?: (result: PaymentResult) => void;
}

const MAX_RETRIES = 2;

export function useRazorpay({ onSuccess, onFailure }: UseRazorpayOptions = {}) {
  const { user } = useAuthStore();
  const [state, setState] = useState<PaymentState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initiatePayment = useCallback(async (jobId: string, jobTitle: string) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh and try again.');
      setState('failed');
      return;
    }

    setError(null);
    setState('creating_order');

    let orderData: { orderId: string; amount: number; currency: string; paymentId: string };
    try {
      const res: any = await paymentsApi.createOrder(jobId);
      orderData = res.data;
    } catch (err: any) {
      const msg = err?.message || 'Failed to create payment order';
      setError(msg);
      setState('failed');
      onFailure?.({ success: false, error: msg });
      return;
    }

    setState('awaiting_payment');

    return new Promise<void>((resolve) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LabourPlatform',
        description: jobTitle,
        order_id: orderData.orderId,
        prefill: { name: user?.name ?? '', contact: user?.phone ?? '' },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setState('idle');
            resolve();
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setState('verifying');
          try {
            await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setState('success');
            setRetryCount(0);
            setError(null);
            onSuccess?.({ success: true, paymentId: orderData.paymentId });
          } catch (err: any) {
            const msg = err?.message || 'Payment verification failed. Contact support if amount was deducted.';
            setError(msg);
            setState('failed');
            onFailure?.({ success: false, error: msg });
          }
          resolve();
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        const msg = resp?.error?.description || 'Payment failed';
        setError(msg);
        setState('failed');
        onFailure?.({ success: false, error: msg });
        resolve();
      });
      rzp.open();
    });
  }, [user, onSuccess, onFailure]);

  const retry = useCallback((jobId: string, jobTitle: string) => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please contact support.');
      return;
    }
    setRetryCount((c) => c + 1);
    setError(null); // clear previous error before retry
    setState('retrying');
    initiatePayment(jobId, jobTitle);
  }, [retryCount, initiatePayment]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    state,
    error,
    retryCount,
    canRetry: retryCount < MAX_RETRIES,
    isLoading: ['creating_order', 'awaiting_payment', 'verifying', 'retrying'].includes(state),
    initiatePayment,
    retry,
    reset,
  };
}
