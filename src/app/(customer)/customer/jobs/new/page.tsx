'use client';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui/Spinner';
import { BookingWizard } from './BookingWizard';

export default function NewJobPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingWizard />
    </Suspense>
  );
}
