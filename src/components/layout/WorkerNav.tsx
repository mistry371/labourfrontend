'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth.store';
import { NotificationBell } from './NotificationBell';

const NAV_ITEMS = [
  { href: '/worker/dashboard', icon: '🏠', label: 'Home' },
  { href: '/worker/jobs', icon: '📋', label: 'Jobs' },
  { href: '/worker/earnings', icon: '💰', label: 'Earnings' },
  { href: '/worker/profile', icon: '👤', label: 'Profile' },
];

export function WorkerNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isActive = (href: string) => href === '/worker/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <header className="glass border-b border-white/30 px-4 py-3 flex items-center justify-between sticky top-0 z-40 sm:pl-60">
        <div className="flex items-center gap-2 sm:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center shadow-teal">
            <span className="text-white font-black text-xs">SV</span>
          </div>
          <span className="font-black text-teal-800 text-base">Worker Panel</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-teal-800">
            {NAV_ITEMS.find(n => isActive(n.href))?.label || 'Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-800 rounded-full flex items-center justify-center text-sm font-black text-white shadow-teal">
              {user?.name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-teal-800 leading-none">{user?.name?.split(' ')[0]}</p>
              <p className="text-xs text-teal-400">Worker</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/30 z-40 sm:hidden">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={clsx('flex-1 flex flex-col items-center py-2.5 text-xs transition-all duration-200 relative',
                  active ? 'text-teal-700' : 'text-teal-400 hover:text-teal-600')}>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />}
                <span className={clsx('text-xl transition-transform duration-200', active && 'scale-110')}>{item.icon}</span>
                <span className={clsx('mt-0.5', active && 'font-bold')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <aside className="hidden sm:flex flex-col w-56 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-30 shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center">
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
                  active ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-teal-600 hover:bg-gray-50 hover:text-teal-800')}>
                <span className={clsx('transition-transform duration-200', active && 'scale-110')}>{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-2 h-2 bg-teal-600 rounded-full" />}
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
