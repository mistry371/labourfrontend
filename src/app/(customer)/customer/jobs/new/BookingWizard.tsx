'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jobsApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { Stepper } from '@/components/ui/Stepper';
import {
  loadDraft, saveDraft, clearDraft, useAutosaveDraft, BookingDraft, DRAFT_DEFAULTS,
} from '@/hooks/useBookingDraft';

import { StepService }   from './steps/StepService';
import { StepDescribe }  from './steps/StepDescribe';
import { StepMedia }     from './steps/StepMedia';
import { StepLocation }  from './steps/StepLocation';
import { StepSchedule }  from './steps/StepSchedule';
import { StepConfirm }   from './steps/StepConfirm';

const STEPS = [
  { label: 'Service' },
  { label: 'Details' },
  { label: 'Photos' },
  { label: 'Location' },
  { label: 'Schedule' },
  { label: 'Confirm' },
];

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();

  const [draft, setDraft] = useState<BookingDraft>(() => {
    const saved = loadDraft();
    return {
      ...DRAFT_DEFAULTS,
      ...saved,
      // URL params override draft for category
      categoryId: params.get('category') || saved?.categoryId || '',
      step: 0, // always start at step 0 on mount
    };
  });

  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Check if there's a meaningful draft to restore
  useEffect(() => {
    const saved = loadDraft();
    if (saved && saved.step > 0 && (saved.title || saved.categoryId)) {
      setDraftRestored(true);
    }
  }, []);

  // Autosave on every change
  useAutosaveDraft(draft);

  const update = useCallback((patch: Partial<BookingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const next = useCallback(() => {
    setDraft((prev) => ({ ...prev, step: Math.min(STEPS.length - 1, prev.step + 1) }));
  }, []);

  const back = useCallback(() => {
    setDraft((prev) => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  }, []);

  const restoreDraft = () => {
    const saved = loadDraft();
    if (saved) setDraft({ ...saved });
    setDraftRestored(false);
  };

  const submit = async () => {
    if (!draft.categoryId) { toast.error('Please select a service category'); return; }
    if (!draft.title?.trim()) { toast.error('Please describe what you need'); return; }
    if (!draft.jobLatitude || !draft.jobLongitude) {
      toast.error('Please set your service location');
      return;
    }
    if (submitting) return; // prevent double-submit
    setSubmitting(true);
    try {
      const res: any = await jobsApi.create({
        title: draft.title,
        description: draft.description,
        categoryId: draft.categoryId,
        categoryName: draft.categoryName,
        serviceId: draft.serviceId || undefined,
        serviceName: draft.serviceName || undefined,
        jobAddress: draft.jobAddress,
        jobLatitude: draft.jobLatitude,
        jobLongitude: draft.jobLongitude,
        scheduledAt: draft.scheduledAt || undefined,
        estimatedPrice: draft.estimatedPrice,
        mediaUrls: draft.mediaUrls,
      });
      clearDraft();
      toast.success('Job created! Finding a worker...');
      router.push(`/customer/jobs/${res.data.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create job. Please try again.');
      setSubmitting(false);
    }
  };

  const stepProps = { draft, update, onNext: next, onBack: back };

  return (
    <div className="min-h-screen bg-green-50/30">
      {/* Header */}
      <div className="bg-white border-b border-teal-100 sticky top-0 z-30 shadow-card">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => draft.step === 0 ? router.back() : back()}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-teal-200 text-teal-600 hover:bg-teal-50 transition shrink-0"
              aria-label="Go back"
            >
              ←
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">SV</span>
              </div>
              <h1 className="text-lg font-bold text-teal-800">Book a Service</h1>
            </div>
            <span className="ml-auto badge badge-green text-xs">Step {draft.step + 1}/{STEPS.length}</span>
          </div>
          <Stepper steps={STEPS} current={draft.step} />
        </div>
      </div>

      {/* Draft restore banner */}
      {draftRestored && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-teal-700">📋 You have an unfinished booking.</p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={restoreDraft}
                className="text-xs font-semibold text-green-700 hover:text-green-800"
              >
                Resume →
              </button>
              <button
                onClick={() => { clearDraft(); setDraftRestored(false); }}
                className="text-xs text-teal-400 hover:text-teal-600"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <div key={draft.step} className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-8 animate-fade-in">
        {draft.step === 0 && <StepService {...stepProps} />}
        {draft.step === 1 && <StepDescribe {...stepProps} />}
        {draft.step === 2 && <StepMedia {...stepProps} />}
        {draft.step === 3 && <StepLocation {...stepProps} />}
        {draft.step === 4 && <StepSchedule {...stepProps} />}
        {draft.step === 5 && (
          <StepConfirm {...stepProps} onSubmit={submit} submitting={submitting} />
        )}
      </div>
    </div>
  );
}
