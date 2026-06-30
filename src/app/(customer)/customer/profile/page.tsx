'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/Toast';

interface ProfileForm { name: string; email: string; }

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileForm>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email || '' });
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const res: any = await usersApi.updateProfile(data);
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (err: any) { toast.error(err?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-xl font-black text-teal-800 mb-5">My Profile</h1>

      {/* Avatar card */}
      <div className="bg-hero rounded-2xl p-6 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-green">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-black text-white text-lg">{user?.name}</p>
            <p className="text-teal-300 text-sm mt-0.5">+91 {user?.phone}</p>
            <span className="inline-block mt-1.5 text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full capitalize font-medium">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-bold text-teal-800 mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-teal-700 mb-1.5">Full Name</label>
            <input {...register('name', { required: 'Name is required' })}
              className="input w-full" placeholder="Your full name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-teal-700 mb-1.5">Email (optional)</label>
            <input type="email" {...register('email')} placeholder="your@email.com" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-teal-700 mb-1.5">Phone</label>
            <input value={`+91 ${user?.phone}`} disabled className="input w-full bg-teal-50 text-teal-400 cursor-not-allowed" />
            <p className="text-xs text-teal-300 mt-1">Phone number cannot be changed</p>
          </div>
          <button type="submit" disabled={saving || !isDirty} className="btn btn-primary w-full">
            {saving ? '⏳ Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <button onClick={logout} className="w-full border border-red-200 text-red-500 py-3 rounded-2xl font-semibold hover:bg-red-50 transition-colors">
        Sign Out
      </button>
    </div>
  );
}
