'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { WorkerNav } from '@/components/layout/WorkerNav';
import { ToastContainer } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login?role=worker'); return; }
    if (user?.role === 'customer') { router.replace('/dashboard'); return; }
    if (user?.role === 'admin') { router.replace('/admin/dashboard'); return; }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerNav />
      <main className="pb-20 sm:pb-0">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
