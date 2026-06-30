'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SERVICE_CATEGORIES, ServiceCategory } from '@/types';

type Sort = 'default' | 'price_asc' | 'price_desc';

function sorted(cats: ServiceCategory[], s: Sort) {
  if (s === 'price_asc') return [...cats].sort((a, b) => a.basePrice - b.basePrice);
  if (s === 'price_desc') return [...cats].sort((a, b) => b.basePrice - a.basePrice);
  return cats;
}

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('default');

  const filtered = sorted(
    SERVICE_CATEGORIES.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    ), sort
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-black text-teal-800">Services</h1>
        <p className="text-teal-400 text-sm mt-0.5">{SERVICE_CATEGORIES.length} services available</p>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 text-sm pointer-events-none">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className="input pl-9 w-full" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="input px-3 py-2.5 text-sm">
          <option value="default">Default</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-black text-teal-800 mb-2">No results for "{search}"</p>
          <button onClick={() => setSearch('')} className="btn btn-ghost text-sm border border-teal-100">Clear search</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((cat, i) => (
            <Link key={cat.id} href={`/customer/jobs/new?category=${cat.id}`}
              style={{ animationDelay: `${i * 40}ms` }}
              className="card p-4 group active:scale-95 animate-fade-in">
              <div className="text-4xl mb-2.5 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="font-black text-teal-800 text-sm group-hover:text-green-600 transition-colors leading-tight">{cat.name}</h3>
              <p className="text-xs text-teal-400 mt-1 line-clamp-2">{cat.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-black text-green-600">from ₹{cat.basePrice}</span>
                <span className="text-xs text-teal-300">{cat.children?.length ?? 0} types</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
