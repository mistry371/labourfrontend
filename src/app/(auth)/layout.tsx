'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') router.replace('/admin/dashboard');
    else if (user.role === 'worker') router.replace('/worker/dashboard');
    else router.replace('/customer/dashboard');
  }, [user, router]);

  return <>{children}</>;
}
