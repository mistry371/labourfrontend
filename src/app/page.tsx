'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Footer from '@/components/layout/Footer';
import PublicNav from '@/components/layout/PublicNav';

const SERVICES = [
  { icon: '💻', name: 'Laptop Repair', price: '₹299', desc: 'Screen, battery, software', color: 'from-violet-500 to-purple-600' },
  { icon: '📷', name: 'CCTV Setup', price: '₹799', desc: 'Install, configure, repair', color: 'from-teal-500 to-green-600' },
  { icon: '🌐', name: 'Networking', price: '₹499', desc: 'WiFi, router, LAN setup', color: 'from-indigo-500 to-blue-600' },
  { icon: '📱', name: 'Mobile Repair', price: '₹249', desc: 'Screen, battery, charging', color: 'from-rose-500 to-pink-600' },
  { icon: '🖨️', name: 'Printer Repair', price: '₹349', desc: 'Jam, ink, connectivity', color: 'from-orange-500 to-red-500' },
  { icon: '🏠', name: 'Smart Home', price: '₹599', desc: 'IoT, automation, Alexa', color: 'from-emerald-500 to-teal-600' },
  { icon: '🗄️', name: 'Server Setup', price: '₹1499', desc: 'Windows, Linux, NAS setup', color: 'from-blue-500 to-cyan-500' },
  { icon: '💾', name: 'Data Recovery', price: '₹999', desc: 'Hard drive, SSD, USB recovery', color: 'from-yellow-500 to-orange-500' },
  { icon: '🖥️', name: 'Desktop Repair', price: '₹249', desc: 'Motherboard, RAM, PSU fix', color: 'from-green-500 to-teal-500' },
  { icon: '🎮', name: 'Gaming PC', price: '₹899', desc: 'Custom assembly & cooling', color: 'from-amber-600 to-yellow-600' },
  { icon: '🛡️', name: 'Virus Removal', price: '₹199', desc: 'Malware, trojan, ransomware', color: 'from-pink-500 to-rose-500' },
  { icon: '🚀', name: 'PC Optimization', price: '₹149', desc: 'Speed up & clean junk files', color: 'from-sky-500 to-blue-600' },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Happy Customers', icon: '😊' },
  { value: 8000, suffix: '+', label: 'Skilled Workers', icon: '👷' },
  { value: 120, suffix: '+', label: 'Cities Covered', icon: '🏙️' },
  { value: 48, suffix: '★', label: 'Average Rating', icon: '⭐' },
];

const STEPS = [
  { step: '01', title: 'Choose Service', desc: 'Browse 100+ services and select what you need', icon: '🔍' },
  { step: '02', title: 'Book Instantly', desc: 'Pick your time slot and confirm in 60 seconds', icon: '📅' },
  { step: '03', title: 'Worker Arrives', desc: 'Verified professional arrives at your doorstep', icon: '🚗' },
  { step: '04', title: 'Job Done', desc: 'Pay securely after the work is completed', icon: '✅' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Booked a laptop repair at 10pm and the technician arrived in 30 mins. Absolutely incredible service!', avatar: 'PS', service: 'Laptop Repair' },
  { name: 'Rahul Mehta', city: 'Delhi', rating: 5, text: 'The network engineer was professional, clean, and fixed our office Wi-Fi perfectly. Will use again!', avatar: 'RM', service: 'Networking' },
  { name: 'Anita Patel', city: 'Bangalore', rating: 5, text: 'CCTV setup was outstanding. The cameras are crystal clear and the app setup was seamless. Highly recommend!', avatar: 'AP', service: 'CCTV Setup' },
  { name: 'Vikram Singh', city: 'Pune', rating: 5, text: 'Transparent pricing, no hidden charges. The technician recovered all my lost data in just a few hours.', avatar: 'VS', service: 'Data Recovery' },
];

const IT_FEATURES = [
  { icon: '🔍', title: 'Free Diagnosis', desc: 'Get a detailed diagnosis before committing to any repair' },
  { icon: '💰', title: 'Transparent Quote', desc: 'Approve or reject the repair quote — no surprises' },
  { icon: '🌐', title: 'Remote Support', desc: 'Many IT issues resolved remotely within minutes' },
  { icon: '🛡️', title: '90-Day Warranty', desc: 'All IT repairs come with a 90-day service warranty' },
];

const TRUST_BADGES = [
  { icon: '✅', title: 'Background Verified', desc: 'Every worker is police verified' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Razorpay encrypted transactions' },
  { icon: '⭐', title: '4.8/5 Rating', desc: 'From 50,000+ verified reviews' },
  { icon: '🔄', title: 'Free Rework', desc: 'Not satisfied? We redo for free' },
  { icon: '📞', title: '24/7 Support', desc: 'Always here when you need us' },
  { icon: '💳', title: 'Pay After Work', desc: 'Pay only when job is done' },
];

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-hero overflow-hidden pt-16">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl animate-blob anim-delay-300" />
        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 text-sm font-medium">1000+ workers available now</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                On-Demand<br />
                <span className="text-gradient">Skilled Workers</span><br />
                At Your Door
              </h1>
              <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-lg">
                Book verified IT technicians, hardware experts & more in under 60 seconds. Real-time tracking, transparent pricing, guaranteed quality.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/login" className="btn btn-primary btn-lg animate-pulse-green">Book a Service →</Link>
                <Link href="/become-worker" className="btn btn-lg" style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
                  Become a Worker
                </Link>
              </div>
              <div className="flex flex-wrap gap-5">
                {['✅ Verified Workers', '🔒 Secure Payments', '⚡ 30-min Response', '⭐ 4.8 Rated'].map(t => (
                  <span key={t} className="text-white/60 text-sm font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Floating card */}
            <div className="hidden lg:flex justify-center animate-fade-right anim-delay-200">
              <div className="relative">
                <div className="w-80 card-glass p-6 rounded-3xl animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center text-2xl">🔧</div>
                    <div>
                      <p className="font-bold text-teal-800">Technician Assigned!</p>
                      <p className="text-sm text-teal-600">Arriving in 28 minutes</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full mb-4">
                    <div className="h-2 bg-brand-green rounded-full w-3/4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">RK</div>
                      <div>
                        <p className="text-xs font-semibold text-teal-800">Rajesh Kumar</p>
                        <p className="text-xs text-teal-500">⭐ 4.9 · 847 jobs</p>
                      </div>
                    </div>
                    <span className="badge badge-green">En Route</span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-8 card-glass p-3 rounded-2xl animate-float anim-delay-200">
                  <p className="text-xs font-bold text-teal-800">⭐ 4.8/5</p>
                  <p className="text-xs text-teal-500">50K+ reviews</p>
                </div>
                <div className="absolute -bottom-6 -left-8 card-glass p-3 rounded-2xl animate-float anim-delay-400">
                  <p className="text-xs font-bold text-green-700">✅ Verified</p>
                  <p className="text-xs text-teal-500">Background checked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none"><path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="white"/></svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section-sm bg-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card text-center">
                <div className="text-4xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black text-teal-800 mb-1">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-teal-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-10 bg-green-50/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRUST_BADGES.map(b => (
              <div key={b.title} className="text-center p-4">
                <div className="text-3xl mb-2">{b.icon}</div>
                <p className="font-bold text-teal-800 text-sm">{b.title}</p>
                <p className="text-teal-500 text-xs mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <span className="badge badge-green mb-3">100+ Services</span>
            <h2 className="text-3xl sm:text-4xl font-black text-teal-800 mb-4">What Do You Need Today?</h2>
            <p className="text-teal-500 text-lg max-w-xl mx-auto">Comprehensive IT technical services — all in one platform</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {SERVICES.map((s) => (
              <Link key={s.name} href="/login" className="card-premium p-5 text-center group">
                <div className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {s.icon}
                </div>
                <h3 className="font-bold text-teal-800 mb-1 text-sm">{s.name}</h3>
                <p className="text-xs text-teal-500 mb-2">{s.desc}</p>
                <span className="text-green-600 font-bold text-xs">from {s.price}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services" className="btn btn-outline">View All 100+ Services →</Link>
          </div>
        </div>
      </section>

      {/* ── IT SERVICES HIGHLIGHT ── */}
      <section className="section bg-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-500/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-400/30 rounded-full blur-3xl animate-blob anim-delay-300" />
        </div>
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="badge badge-green mb-4">New — IT Services</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Tech Problems?<br />We Fix Everything 💻
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                From laptop screen repairs to CCTV installation, server setup to smart home automation — our certified IT technicians handle it all, onsite or remotely.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {IT_FEATURES.map(f => (
                  <div key={f.title} className="card-glass p-4 rounded-2xl">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <p className="font-bold text-teal-800 text-sm">{f.title}</p>
                    <p className="text-teal-600 text-xs mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn btn-primary btn-lg">Book IT Service →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '💻', name: 'Laptop Repair', count: '2,400+ fixed', color: 'from-violet-500 to-purple-600' },
                { icon: '📷', name: 'CCTV Setup', count: '1,800+ installed', color: 'from-teal-500 to-green-600' },
                { icon: '🌐', name: 'Networking', count: '3,200+ setups', color: 'from-indigo-500 to-blue-600' },
                { icon: '📱', name: 'Mobile Repair', count: '5,100+ repaired', color: 'from-rose-500 to-pink-600' },
                { icon: '🗄️', name: 'Server Setup', count: '400+ deployed', color: 'from-amber-500 to-orange-600' },
                { icon: '🏠', name: 'Smart Home', count: '900+ automated', color: 'from-emerald-500 to-teal-600' },
              ].map(s => (
                <div key={s.name} className="card-glass p-4 rounded-2xl text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-xl mx-auto mb-2`}>{s.icon}</div>
                  <p className="font-bold text-teal-800 text-sm">{s.name}</p>
                  <p className="text-teal-500 text-xs">{s.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <span className="badge badge-teal mb-3">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-black text-teal-800 mb-4">Book in 60 Seconds</h2>
            <p className="text-teal-500 text-lg">From booking to completion — seamlessly simple</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200" />
            {STEPS.map((s, i) => (
              <div key={s.step} className="text-center relative">
                <div className="w-20 h-20 bg-brand-green rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-green hover-glow relative z-10">
                  {s.icon}
                </div>
                <div className="text-xs font-black text-green-500 mb-1">STEP {s.step}</div>
                <h3 className="font-bold text-teal-800 mb-2">{s.title}</h3>
                <p className="text-sm text-teal-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section bg-green-50/50">
        <div className="container">
          <div className="text-center mb-12">
            <span className="badge badge-green mb-3">Customer Love</span>
            <h2 className="text-3xl sm:text-4xl font-black text-teal-800 mb-4">What Our Customers Say</h2>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-xl">★</span>)}
            </div>
            <p className="text-teal-500">4.8/5 from 50,000+ reviews</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`card p-6 rounded-3xl transition-all duration-500 ${i === activeTestimonial ? 'ring-2 ring-green-400 shadow-green' : ''}`}>
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-teal-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-teal-800 text-sm">{t.name}</p>
                    <p className="text-teal-400 text-xs">{t.city} · {t.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKER CTA ── */}
      <section className="section bg-white">
        <div className="container">
          <div className="rounded-3xl p-8 sm:p-12 border border-green-100 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#f0faf0,#f0f7fa)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/30 rounded-full blur-3xl" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="badge badge-green mb-4">For Workers</span>
                <h2 className="text-3xl sm:text-4xl font-black text-teal-800 mb-4">Earn ₹30,000+/month on Your Schedule</h2>
                <p className="text-teal-600 text-lg mb-6 leading-relaxed">Join 8,000+ skilled workers earning great income. Set your own hours, choose your jobs, get paid instantly.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[['₹30K+', 'Monthly Earnings'], ['2-day', 'Quick Onboarding'], ['100%', 'Payment Guarantee'], ['24/7', 'Support']].map(([v, l]) => (
                    <div key={l} className="bg-white rounded-2xl p-4 border border-green-100">
                      <div className="text-2xl font-black text-green-600">{v}</div>
                      <div className="text-sm text-teal-500">{l}</div>
                    </div>
                  ))}
                </div>
                <Link href="/become-worker" className="btn btn-primary btn-lg">Join as Worker →</Link>
              </div>
              <div className="hidden lg:block">
                <div className="card p-6 rounded-3xl max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-brand-green rounded-2xl flex items-center justify-center text-2xl">👷</div>
                    <div>
                      <p className="font-bold text-teal-800">Suresh Patel</p>
                      <p className="text-sm text-teal-500">Electrician · Level 3</p>
                    </div>
                    <span className="ml-auto badge badge-gold">⭐ Pro</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    {[['This Month', '₹34,200', '+12%'], ['Jobs Done', '47', '+8'], ['Rating', '4.9★', 'Top 5%']].map(([l, v, c]) => (
                      <div key={l} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm text-teal-600">{l}</span>
                        <div className="text-right">
                          <span className="font-bold text-teal-800">{v}</span>
                          <span className="text-xs text-green-600 ml-2">{c}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-brand-green rounded-full w-4/5" />
                  </div>
                  <p className="text-xs text-teal-500 mt-1">80% to Gold Badge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section bg-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/15 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl animate-blob anim-delay-300" />
        </div>
        <div className="container relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/70 text-xl mb-10 max-w-xl mx-auto">Join 50,000+ customers who trust Suvidhaye for their home & IT services</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/login" className="btn btn-primary btn-xl animate-pulse-green">Book Your First Service →</Link>
            <Link href="/register?role=worker" className="btn btn-xl" style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
              Become a Worker
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
