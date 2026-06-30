'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jobsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { SERVICE_CATEGORIES, Job } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

const QUICK_SERVICES = SERVICE_CATEGORIES.slice(0, 8);

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    jobsApi.getMyJobs(1).then((res: any) => {
      setRecentJobs(res.data?.jobs?.slice(0, 3) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeJob = recentJobs.find(j => ['assigned', 'worker_enroute', 'in_progress', 'matching'].includes(j.status));

  return (
    <div className="pb-24 sm:pb-12 animate-fade-in bg-gray-50/50 min-h-screen">
      
      {/* ── Premium Welcome Banner ── */}
      <div className="relative bg-[#1b3a4b] pt-12 pb-24 px-6 sm:px-12 overflow-hidden">
        {/* Soft abstract background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5cb85c]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f59e0b]/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[#5cb85c] font-medium text-sm mb-2 tracking-wide uppercase">{greeting}</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-md">
              Need a repair, installation, or maintenance? We've got the experts.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-xl">🛡️</span>
              <span className="text-white text-sm font-semibold">100% Quality Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 -mt-12 relative z-20 space-y-8">
        
        {/* Active Job / Primary CTA Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Main Book CTA */}
          <Link href="/customer/jobs/new"
            className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5cb85c]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="w-16 h-16 bg-[#5cb85c]/10 text-[#5cb85c] rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
              ➕
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-[#1b3a4b] mb-1 group-hover:text-[#5cb85c] transition-colors">Book a Service</h2>
              <p className="text-sm text-gray-500 font-medium">Over 50+ professional services</p>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#5cb85c] group-hover:text-white transition-colors">
              →
            </div>
          </Link>

          {/* Active Job Card (if exists) or Secondary Card */}
          {activeJob ? (
            <Link href={`/customer/jobs/${activeJob.id}`}
              className="group bg-[#5cb85c] p-6 rounded-3xl shadow-lg shadow-[#5cb85c]/30 text-white hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-white/20 text-white px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Active Job</span>
                  <h3 className="text-lg font-bold mt-2 truncate max-w-[200px]">{activeJob.title}</h3>
                </div>
                <StatusBadge status={activeJob.status} />
              </div>
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-2/3 rounded-full animate-pulse" />
              </div>
              <p className="text-sm text-white/80 mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Track live progress
              </p>
            </Link>
          ) : (
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
               <div>
                 <h2 className="text-lg font-black text-[#1b3a4b] mb-1">Refer & Earn</h2>
                 <p className="text-sm text-gray-500 font-medium">Get ₹500 for every friend</p>
               </div>
               <div className="text-4xl">🎁</div>
             </div>
          )}
        </div>

        {/* ── Popular Services Grid ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#1b3a4b]">What do you need?</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Select a category to get started</p>
            </div>
            <Link href="/customer/services" className="text-sm font-bold text-[#5cb85c] hover:text-[#3d9b3d] bg-[#5cb85c]/10 px-4 py-2 rounded-xl transition-colors">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_SERVICES.map((cat) => (
              <Link key={cat.id} href={`/customer/jobs/new?category=${cat.id}`}
                className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#5cb85c]/30 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:-translate-y-2 group-hover:bg-[#5cb85c]/10 transition-all duration-300">
                  {cat.icon}
                </div>
                <h3 className="text-sm font-bold text-[#1b3a4b] leading-tight mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-400 font-medium line-clamp-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recent Jobs ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#1b3a4b]">Recent Activity</h2>
            <Link href="/customer/jobs" className="text-sm font-bold text-gray-400 hover:text-[#1b3a4b] transition-colors">
              See History →
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded-full w-1/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-[#1b3a4b] mb-1">No services yet</h3>
                <p className="text-sm text-gray-500 mb-6">Book your first service and experience the magic.</p>
                <Link href="/customer/jobs/new" className="bg-[#1b3a4b] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1b3a4b]/90 transition-colors">
                  Explore Services
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentJobs.map(job => (
                  <Link key={job.id} href={`/customer/jobs/${job.id}`}
                    className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 group-hover:bg-[#5cb85c]/10 transition-all">
                      {SERVICE_CATEGORIES.find(c => c.id === job.categoryId)?.icon || '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1b3a4b] truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-sm font-bold text-[#1b3a4b]">₹{job.budget}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
