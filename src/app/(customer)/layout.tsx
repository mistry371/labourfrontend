'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { CustomerNav } from '@/components/layout/CustomerNav';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!accessToken) router.replace('/login');
    else if (user?.role && user.role !== 'customer') router.replace('/login');
  }, [accessToken, user, router]);
  if (!accessToken) return null;
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNav />
      <main className="sm:pl-56 min-h-screen">{children}</main>
    </div>
  );
}
