import type { BookingDraft } from '@/hooks/useBookingDraft';

export interface StepProps {
  draft: BookingDraft;
  update: (patch: Partial<BookingDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}
