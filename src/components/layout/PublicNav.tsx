'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 bg-white/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center shadow-green">
            <span className="text-white font-black text-sm">SV</span>
          </div>
          <span className="font-black text-teal-700 text-lg">Suvi<span className="text-green-600">dhaye</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {[['Services', '/services'], ['How It Works', '/how-it-works'], ['About Us', '/about']].map(([l, h]) => (
            <Link key={h} href={h} className="text-sm font-medium text-teal-700 hover:text-green-600 transition-colors">{l}</Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost btn-sm text-teal-700">Sign In</Link>
          <Link href="/register" className="btn btn-outline btn-sm">Register</Link>
          <Link href="/login" className="btn btn-primary btn-sm">Book Now</Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-teal-700" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ transform: menuOpen ? 'rotate(45deg) translate(3px,3px)' : '' }} />
          <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
          <div className="w-5 h-0.5 bg-current transition-all" style={{ transform: menuOpen ? 'rotate(-45deg) translate(3px,-3px)' : '' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {[['Services', '/services'], ['How It Works', '/how-it-works'], ['About Us', '/about']].map(([l, h]) => (
            <Link key={h} href={h} className="block text-sm font-medium text-teal-700 py-2" onClick={() => setMenuOpen(false)}>{l}</Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="btn btn-ghost btn-sm flex-1 text-center text-teal-700" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link href="/register" className="btn btn-primary btn-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
