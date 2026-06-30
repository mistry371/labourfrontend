'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    icon: '🏠',
    desc: 'Book home & office services',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
  },
  {
    id: 'worker',
    label: 'Worker',
    icon: '🔧',
    desc: 'Earn money with your skills',
    color: 'from-[#f59e0b] to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-[#f59e0b]',
  },
];

const STEPS_LABEL = ['Your Role', 'Your Details', 'Welcome'];

function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<'role' | 'info'>('role');
  const [role, setRole] = useState(params.get('role') || 'customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stepIndex = step === 'role' ? 0 : 1;
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function handleRegister() {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    
    setLoading(true); setError('');
    try {
      const res = await authApi.registerWithPassword(email, password, name, role);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      if (role === 'worker') router.push('/worker/kyc');
      else router.push('/customer/dashboard');
    } catch (e: any) { 
      setError(e?.message || 'Registration failed'); 
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#1b3a4b] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #5cb85c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 40%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5cb85c]/10 rounded-full blur-3xl" />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-[#5cb85c] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-base">SV</span>
          </div>
          <span className="font-black text-white text-2xl tracking-tight">
            Suvi<span className="text-[#5cb85c]">dhaye</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Join thousands of<br />
              people using<br />
              <span className="text-[#5cb85c]">Suvidhaye</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Whether you need a service or want to offer one — we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { n: '50k+', l: 'Happy Customers' },
              { n: '10k+', l: 'Verified Workers' },
              { n: '4.8/5', l: 'Average Rating' },
              { n: '30min', l: 'Avg Response Time' },
            ].map(s => (
              <div key={s.l} className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-black text-white mb-1">{s.n}</div>
                <div className="text-white/60 text-xs font-medium uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-white relative">
        <div className="absolute top-8 left-0 right-0 px-8 flex items-center justify-center gap-3 max-w-md mx-auto w-full z-10">
          {STEPS_LABEL.map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-center">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  idx <= stepIndex ? 'bg-[#5cb85c]' : 'bg-gray-100'
                }`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                idx <= stepIndex ? 'text-[#1b3a4b]' : 'text-gray-300'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-24 w-full max-w-md mx-auto">
          {/* ── Step 1: Role ── */}
          {step === 'role' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1b3a4b] mb-2">Create account</h1>
                <p className="text-gray-500 text-sm">How do you want to use Suvidhaye?</p>
              </div>

              {/* Google OAuth */}
              <button
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs font-medium">or choose your role</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      role === r.id ? `${r.border} ${r.bg}` : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-3">{r.icon}</div>
                    <div className={`font-bold text-sm mb-1 ${role === r.id ? 'text-[#1b3a4b]' : 'text-gray-700'}`}>
                      {r.label}
                    </div>
                    <div className="text-xs text-gray-500 leading-snug">{r.desc}</div>
                    {role === r.id && (
                      <div className="mt-3 flex items-center gap-1">
                        <div className="w-4 h-4 bg-[#5cb85c] rounded-full flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">✓</span>
                        </div>
                        <span className="text-[#5cb85c] text-xs font-semibold">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('info')}
                className="w-full py-3.5 bg-[#5cb85c] hover:bg-[#3d9b3d] text-white font-bold rounded-2xl transition-colors text-sm"
              >
                Continue as {ROLES.find(r => r.id === role)?.label} →
              </button>

              <p className="text-center text-gray-500 text-sm mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-[#5cb85c] font-bold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* ── Step 2: Info ── */}
          {step === 'info' && (
            <>
              <button
                onClick={() => { setStep('role'); setError(''); }}
                className="flex items-center gap-2 text-gray-400 hover:text-[#1b3a4b] text-sm font-medium mb-8 transition-colors"
              >
                ← Back
              </button>

              <div className="mb-8">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${
                  role === 'worker' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {role === 'worker' ? '🔧 Joining as Worker' : '🏠 Joining as Customer'}
                </div>
                <h1 className="text-3xl font-black text-[#1b3a4b] mb-2">Your details</h1>
                <p className="text-gray-500 text-sm">Create your new account</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1b3a4b] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="Rahul Sharma"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5cb85c] focus:outline-none text-[#1b3a4b] text-sm transition-colors placeholder:text-gray-400"
                    autoComplete="name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1b3a4b] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5cb85c] focus:outline-none text-[#1b3a4b] text-sm transition-colors placeholder:text-gray-400"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1b3a4b] mb-1.5">Create Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5cb85c] focus:outline-none text-[#1b3a4b] text-sm transition-colors placeholder:text-gray-400"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <span className="text-red-500 text-xs mt-0.5">⚠</span>
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#5cb85c] hover:bg-[#3d9b3d] text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                >
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Create Account →'}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-gray-400 text-xs mt-8">
            By registering, you agree to our{' '}
            <Link href="#" className="text-[#5cb85c] hover:underline">Terms</Link> &{' '}
            <Link href="#" className="text-[#5cb85c] hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#5cb85c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
