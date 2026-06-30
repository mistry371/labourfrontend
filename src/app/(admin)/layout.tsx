'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AdminNav } from '@/components/layout/AdminNav';
import { ToastContainer } from '@/components/ui/Toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!accessToken) router.replace('/login');
    else if (user?.role !== 'admin') router.replace('/login');
  }, [accessToken, user, router]);
  if (!accessToken) return null;
  return (
    <div className="min-h-screen" style={{ background: '#0f2330' }}>
      <AdminNav />
      <main className="pl-60 min-h-screen" style={{ background: '#0f2330' }}>
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
