'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth.store';
import { NotificationBell } from '@/components/layout/NotificationBell';

const NAV_ITEMS = [
  { href: '/customer/dashboard', icon: '🏠', label: 'Home' },
  { href: '/customer/services', icon: '🔍', label: 'Services' },
  { href: '/customer/jobs', icon: '📋', label: 'My Jobs' },
  { href: '/customer/payments', icon: '💳', label: 'Payments' },
  { href: '/customer/profile', icon: '👤', label: 'Profile' },
];

export function CustomerNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isActive = (href: string) => href === '/customer/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Top header */}
      <header className="glass border-b border-white/30 px-4 py-3 flex items-center justify-between sticky top-0 z-40 sm:pl-60">
        <div className="flex items-center gap-2 sm:hidden">
          <div className="w-8 h-8 bg-brand-green rounded-xl flex items-center justify-center shadow-green">
            <span className="text-white font-black text-xs">SV</span>
          </div>
          <span className="font-black text-teal-800 text-base"><span>Suvi</span><span className="text-green-600">dhaye</span></span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-teal-800">
            {NAV_ITEMS.find(n => isActive(n.href))?.label || 'Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-9 h-9 bg-brand-green rounded-full flex items-center justify-center text-sm font-black text-white shadow-green">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-teal-800 leading-none">{user?.name?.split(' ')[0]}</p>
              <p className="text-xs text-teal-400">Customer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/30 z-40 sm:hidden">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={clsx('flex-1 flex flex-col items-center py-2.5 text-xs transition-all duration-200 relative',
                  active ? 'text-green-600' : 'text-teal-400 hover:text-teal-600')}>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-500 rounded-full" />}
                <span className={clsx('text-xl transition-transform duration-200', active && 'scale-110')}>{item.icon}</span>
                <span className={clsx('mt-0.5', active && 'font-bold text-green-600')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side nav (desktop) */}
      <aside className="hidden sm:flex flex-col w-56 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-30 shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center shadow-green">
              <span className="text-white font-black text-sm">SV</span>
            </div>
            <div>
              <span className="font-black text-teal-800 text-lg leading-none">Suvi</span>
              <span className="font-black text-green-600 text-lg leading-none">dhaye</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' : 'text-teal-600 hover:bg-gray-50 hover:text-teal-800')}>
                <span className={clsx('transition-transform duration-200', active && 'scale-110')}>{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
