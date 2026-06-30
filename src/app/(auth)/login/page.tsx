'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const FEATURES = [
  { icon: '⚡', text: 'Book services in under 2 minutes' },
  { icon: '🛡️', text: 'Verified & background-checked workers' },
  { icon: '💳', text: 'Secure escrow payments' },
  { icon: '📍', text: 'Real-time job tracking' },
];

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const role = params.get('role') || 'customer';

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function handlePasswordLogin() {
    if (!isValidEmail(email)) { setError('Enter a valid email address'); return; }
    if (!password) { setError('Enter your password'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.loginWithPassword(email, password);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      const r = res.data.user.role;
      if (r === 'admin') router.push('/admin/dashboard');
      else if (r === 'worker') router.push('/worker/dashboard');
      else router.push('/customer/dashboard');
    } catch (e: any) {
      if (e?.message?.includes('timeout') || e?.message?.includes('exceeded')) {
        setError('Server is waking up — please retry in 10 seconds.');
      } else {
        setError(e?.message || 'Invalid credentials');
      }
    } finally { setLoading(false); }
  }

  async function sendOtp() {
    if (!isValidEmail(email)) { setError('Enter a valid email address'); return; }
    setLoading(true); setError('');
    try {
      await authApi.sendOtp(email);
      setStep('otp');
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.verifyOtp(email, otp, undefined, role);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      const r = res.data.user.role;
      if (r === 'admin') router.push('/admin/dashboard');
      else if (r === 'worker') router.push('/worker/dashboard');
      else router.push('/customer/dashboard');
    } catch (e: any) { setError(e?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#1b3a4b] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #5cb85c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 40%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5cb85c]/10 rounded-full blur-3xl" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-[#5cb85c] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-base">SV</span>
          </div>
          <span className="font-black text-white text-2xl tracking-tight">
            Suvi<span className="text-[#5cb85c]">dhaye</span>
          </span>
        </Link>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Your trusted platform<br />
              for <span className="text-[#5cb85c]">professional</span><br />
              services
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Connect with skilled workers for home, office, and IT services — fast, safe, and reliable.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-white/80 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center bg-white relative">
        <div className="w-full max-w-md mx-auto px-6 py-12">
          {step === 'password' ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1b3a4b] mb-2">Welcome back</h1>
                <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1b3a4b] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5cb85c] focus:outline-none text-[#1b3a4b] text-sm transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-[#1b3a4b]">Password</label>
                    <button onClick={sendOtp} className="text-xs text-[#5cb85c] font-bold hover:underline">Forgot password? Login via OTP</button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5cb85c] focus:outline-none text-[#1b3a4b] text-sm transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <span className="text-red-500 text-xs mt-0.5">⚠</span>
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                <button
                  onClick={handlePasswordLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#5cb85c] hover:bg-[#3d9b3d] text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                >
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                </button>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-xs font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                  onClick={() => { window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/google' }}
                  type="button"
                  className="w-full py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm mb-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 font-medium mb-3 text-center">Sign in as</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['customer', 'worker', 'admin'] as const).map(r => (
                    <Link
                      key={r}
                      href={`/login?role=${r}`}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all capitalize ${
                        role === r
                          ? 'bg-[#1b3a4b] text-white shadow-sm'
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-[#5cb85c] hover:text-[#5cb85c]'
                      }`}
                    >
                      {r === 'customer' ? '👤 ' : r === 'worker' ? '👷 ' : '🛡️ '}{r}
                    </Link>
                  ))}
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                No account?{' '}
                <Link href="/register" className="text-[#5cb85c] font-bold hover:underline">Create one free</Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('password'); setOtp(''); setError(''); }}
                className="flex items-center gap-2 text-gray-400 hover:text-[#1b3a4b] text-sm font-medium mb-8 transition-colors"
              >
                ← Back to Login
              </button>

              <div className="mb-8">
                <div className="w-14 h-14 bg-[#5cb85c]/10 rounded-2xl flex items-center justify-center text-2xl mb-4">📧</div>
                <h1 className="text-3xl font-black text-[#1b3a4b] mb-2">Check your email</h1>
                <p className="text-gray-500 text-sm">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-[#1b3a4b]">{email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1b3a4b] mb-1.5">6-digit OTP</label>
                  <input
                    type="tel"
                    maxLength={6}
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                    placeholder="0  0  0  0  0  0"
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#5cb85c] focus:outline-none text-[#1b3a4b] text-2xl text-center tracking-[0.6em] font-bold transition-colors"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <span className="text-red-500 text-xs mt-0.5">⚠</span>
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#5cb85c] hover:bg-[#3d9b3d] text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                >
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & Sign In →'}
                </button>

                <button
                  onClick={sendOtp}
                  className="w-full py-3 text-gray-500 hover:text-[#5cb85c] text-sm font-medium transition-colors"
                >
                  Didn't receive it? Resend OTP
                </button>
              </div>
            </>
          )}

          <p className="text-center text-gray-400 text-xs mt-8">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-[#5cb85c] hover:underline">Terms</Link> &{' '}
            <Link href="#" className="text-[#5cb85c] hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#5cb85c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
