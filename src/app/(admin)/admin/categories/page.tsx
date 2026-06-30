'use client';
import { useState, useEffect } from 'react';
import { AdminNav } from '@/components/layout/AdminNav';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  children?: { id: string; name: string; slug: string }[];
  createdAt: string;
}

const ICONS = ['🔧', '⚡', '🧹', '🪚', '🎨', '🔌', '🐛', '👕', '🌿', '📷', '🚿', '🏠', '🔑', '🛁', '❄️'];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch(path: string, opts?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts?.headers || {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', icon: '🔧', description: '', basePrice: 300, isActive: true,
  });

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/categories');
      setCategories((res as any)?.data?.categories || (res as any)?.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', slug: '', icon: '🔧', description: '', basePrice: 300, isActive: true });
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description, basePrice: cat.basePrice, isActive: cat.isActive });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/api/v1/categories/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/v1/categories', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchCategories();
    } catch (e: any) {
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    try {
      await apiFetch(`/api/v1/categories/${cat.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      fetchCategories();
    } catch { /* ignore */ }
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-hero">
      <AdminNav />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Service Categories</h1>
            <p className="text-teal-300/70 mt-1">Manage all service categories and subcategories</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary">
            + Add Category
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: categories.length, icon: '📦' },
            { label: 'Active', value: categories.filter(c => c.isActive).length, icon: '✅' },
            { label: 'Inactive', value: categories.filter(c => !c.isActive).length, icon: '⏸️' },
            { label: 'Avg Price', value: `₹${Math.round(categories.reduce((s, c) => s + c.basePrice, 0) / (categories.length || 1))}`, icon: '💰' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 border border-white/10">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-teal-300/70 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="glass rounded-2xl p-4 border border-white/10 mb-6">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search categories..."
            className="w-full bg-transparent text-white placeholder-teal-400/60 outline-none text-sm"
          />
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Category', 'Slug', 'Base Price', 'Subcategories', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-teal-300/70 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-teal-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-teal-400">No categories found</td></tr>
              ) : filtered.map(cat => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">{cat.icon}</div>
                      <div>
                        <p className="font-semibold text-white text-sm">{cat.name}</p>
                        <p className="text-teal-400/70 text-xs truncate max-w-[180px]">{cat.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-teal-300 text-sm font-mono">{cat.slug}</td>
                  <td className="px-5 py-4 text-green-400 font-bold text-sm">₹{cat.basePrice}</td>
                  <td className="px-5 py-4 text-teal-300 text-sm">{cat.children?.length || 0}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(cat)}
                      className={`badge cursor-pointer ${cat.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => openEdit(cat)}
                      className="text-teal-300 hover:text-white text-sm font-medium transition">
                      Edit →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-premium">
            <h2 className="text-xl font-black text-teal-800 mb-5">
              {editing ? 'Edit Category' : 'New Category'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  className="input mt-1" placeholder="e.g. Plumbing" />
              </div>
              <div>
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="input mt-1 font-mono" placeholder="e.g. plumbing" />
              </div>
              <div>
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Icon</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition ${form.icon === ic ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input mt-1" placeholder="Short description" />
              </div>
              <div>
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Base Price (₹)</label>
                <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: +e.target.value }))}
                  className="input mt-1" min={0} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="isActive" className="text-sm text-teal-700 font-medium">Active (visible to customers)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="btn btn-primary flex-1">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
