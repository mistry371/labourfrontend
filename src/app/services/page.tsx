'use client';
import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import PublicNav from '@/components/layout/PublicNav';
import { SERVICE_CATEGORIES } from '@/types';

const ALL_SERVICES = [
  ...SERVICE_CATEGORIES,
];

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const filtered = ALL_SERVICES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <div className="bg-hero py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-green-500 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-400 rounded-full blur-3xl animate-blob anim-delay-300" />
        </div>
        <div className="relative z-10">
          <span className="badge badge-green mb-4">50+ Services</span>
          <h1 className="text-4xl font-black text-white mb-4">All Home Services</h1>
          <p className="text-teal-200/70 text-lg mb-8">Professional, verified workers for every home need</p>
          <div className="max-w-md mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400">🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="input pl-10 bg-white/90 backdrop-blur"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container section">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((s, i) => (
            <Link key={s.id} href={`/services/${s.id}`}
              className={`card-premium p-6 text-center group animate-slide-up delay-${(i%4+1)*100}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-green">
                {s.icon}
              </div>
              <h3 className="font-bold text-teal-800 mb-1">{s.name}</h3>
              <p className="text-xs text-teal-400 mb-3 leading-relaxed">{s.description || ''}</p>
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-black text-sm">from ₹{s.basePrice}</span>
                <span className="badge badge-green text-xs">Book →</span>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-bold text-teal-700">No services found</p>
            <p className="text-teal-400 text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-hero py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to Book?</h2>
        <p className="text-teal-200/70 mb-8">Get a verified professional at your door in 30 minutes</p>
        <Link href="/login" className="btn btn-primary btn-xl animate-pulse-green">Book Now →</Link>
      </div>
      <Footer />
    </div>
  );
}
