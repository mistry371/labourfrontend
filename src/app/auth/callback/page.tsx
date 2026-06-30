'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const role = params.get('role');

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=google_failed');
      return;
    }

    // Fetch user profile with the new token
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    api.get('/api/v1/users/me')
      .then((res: any) => {
        const user = res.data ?? res;
        setAuth(user, accessToken, refreshToken);
        if (role === 'admin') router.replace('/admin/dashboard');
        else if (role === 'worker') router.replace('/worker/dashboard');
        else router.replace('/customer/dashboard');
      })
      .catch(() => {
        // Fallback: use role from params
        setAuth({ role } as any, accessToken, refreshToken);
        if (role === 'admin') router.replace('/admin/dashboard');
        else if (role === 'worker') router.replace('/worker/dashboard');
        else router.replace('/customer/dashboard');
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <div className="w-10 h-10 border-3 border-[#5cb85c] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#1b3a4b] font-semibold text-sm">Signing you in with Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#5cb85c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
