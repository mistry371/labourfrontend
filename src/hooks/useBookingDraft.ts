'use client';
import { useEffect, useCallback } from 'react';

const DRAFT_KEY = 'booking_draft';

export interface BookingDraft {
  step: number;
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  title: string;
  description: string;
  mediaUrls: string[];
  jobAddress: string;
  jobLatitude: number | null;
  jobLongitude: number | null;
  scheduledAt: string;
  estimatedPrice: number | null;
  savedAt?: number;
}

export const DRAFT_DEFAULTS: BookingDraft = {
  step: 0,
  categoryId: '',
  categoryName: '',
  serviceId: '',
  serviceName: '',
  title: '',
  description: '',
  mediaUrls: [],
  jobAddress: '',
  jobLatitude: null,
  jobLongitude: null,
  scheduledAt: '',
  estimatedPrice: null,
};

export function loadDraft(): BookingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft: BookingDraft = JSON.parse(raw);
    // Expire drafts older than 24h
    if (draft.savedAt && Date.now() - draft.savedAt > 86_400_000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Partial<BookingDraft>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadDraft() ?? DRAFT_DEFAULTS;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...existing, ...draft, savedAt: Date.now() }));
  } catch {}
}

export function clearDraft() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
}

/** Hook that auto-saves a value whenever it changes */
export function useAutosaveDraft(data: Partial<BookingDraft>, enabled = true) {
  const save = useCallback(() => {
    if (enabled) saveDraft(data);
  }, [data, enabled]);

  useEffect(() => {
    const id = setTimeout(save, 600); // debounce 600ms
    return () => clearTimeout(id);
  }, [save]);
}
