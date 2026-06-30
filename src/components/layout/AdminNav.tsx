'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/jobs', icon: '📋', label: 'Jobs' },
  { href: '/admin/disputes', icon: '⚖️', label: 'Disputes' },
  { href: '/admin/workers', icon: '👷', label: 'Workers' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/pricing', icon: '💰', label: 'Pricing' },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
];

export function AdminNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-60 text-white min-h-screen fixed left-0 top-0 flex flex-col z-40" style={{ background: '#0f2330' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-green" style={{ background: 'linear-gradient(135deg, #3d9b3d, #5cb85c, #6fcf6f)' }}>
            <span className="text-white font-black text-sm">SV</span>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none">Suvi<span className="text-green-400">dhaye</span></p>
            <p className="text-xs text-white/50">Admin Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active ? 'bg-green-600 text-white shadow-green' : 'text-white/60 hover:bg-white/10 hover:text-white')}>
              <span>{item.icon}</span>
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-green" style={{ background: 'linear-gradient(135deg, #3d9b3d, #5cb85c)' }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-white/50">Administrator</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-left text-sm text-white/50 hover:text-red-400 transition-colors flex items-center gap-2 px-1 py-1">
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
