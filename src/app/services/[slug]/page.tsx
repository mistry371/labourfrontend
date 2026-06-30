import Link from 'next/link';
import { SERVICE_CATEGORIES } from '@/types';
import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, Clock, Star, Zap, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

const ALL_SERVICES = [...SERVICE_CATEGORIES];

const FAQS: Record<string, { q: string; a: string }[]> = {
  laptop_repair: [
    { q: 'How long does a typical laptop repair take?', a: 'Most hardware repairs take 1–2 hours. Software issues are usually resolved within an hour.' },
    { q: 'Is my data safe?', a: 'Yes, our technicians follow strict privacy protocols. We recommend backing up your data if possible before any major hardware repair.' },
  ],
  cctv_setup: [
    { q: 'Do you provide the cameras?', a: 'We can install cameras you have purchased, or you can buy cameras directly from our technicians.' },
    { q: 'Is remote viewing setup included?', a: 'Yes, if your DVR supports it and you have an active internet connection, we will configure mobile viewing at no extra cost.' },
  ],
};

const DEFAULT_FAQS = [
  { q: 'How do I book this service?', a: 'Sign up or log in, select the service, choose your time slot, and confirm. A verified worker will be assigned within minutes.' },
  { q: "What if I'm not satisfied?", a: "We offer a 100% satisfaction guarantee. If you're not happy, we'll send another worker at no extra cost." },
  { q: 'How are workers verified?', a: 'All workers undergo Aadhaar KYC, background checks, and skill assessments before joining.' },
  { q: 'What payment methods are accepted?', a: 'UPI, credit/debit cards, net banking, and wallets via Razorpay.' },
];

export function generateStaticParams() {
  return ALL_SERVICES.map(s => ({ slug: s.id }));
}

export default async function ServiceDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const service = ALL_SERVICES.find(s => s.id === params.slug);

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <PublicNav />
        <div className="text-center mt-20 p-12 bg-white rounded-3xl shadow-xl max-w-md mx-auto">
          <p className="text-6xl mb-6">🔍</p>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Service Not Found</h1>
          <p className="text-slate-500 mb-8">We couldn't find the service you're looking for.</p>
          <Link href="/services" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Browse All Services
          </Link>
        </div>
      </div>
    );
  }

  const faqs = FAQS[service.id] || DEFAULT_FAQS;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-teal-200">
      <PublicNav />

      {/* ULTRA PREMIUM HERO */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-950">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-500/20 blur-[120px] mix-blend-screen" />
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="container relative z-10 px-4 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography & Info */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-semibold mb-6 tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Available in your area
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">{service.name}</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                {service.description || 'Experience world-class service with verified professionals at your doorstep within 30 minutes.'}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-8">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg leading-none">4.8/5</p>
                    <p className="text-sm text-slate-400 mt-1">50k+ Reviews</p>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-white/10 hidden lg:block"></div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg leading-none">30 Min</p>
                    <p className="text-sm text-slate-400 mt-1">Avg. Arrival</p>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden lg:block"></div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg leading-none">100%</p>
                    <p className="text-sm text-slate-400 mt-1">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Booking Card */}
            <div className="lg:col-span-5 relative lg:pl-10">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-teal-500/20 blur-[100px] rounded-full" />
              
              <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/50">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-xs">Estimated Price</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl text-teal-400 font-bold">₹</span>
                      <span className="text-5xl font-black text-white">{service.basePrice}</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-teal-500/30 transform rotate-3 hover:rotate-6 transition-transform">
                    {service.icon}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    'Transparent Pricing - No hidden fees',
                    'Aadhaar Verified Professionals',
                    '30-Day Service Guarantee'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                      <span className="font-medium text-sm lg:text-base">{feat}</span>
                    </div>
                  ))}
                </div>

                <Link href="/customer/jobs/new" className="block w-full py-4 px-6 bg-white text-slate-950 font-black text-lg rounded-xl text-center hover:bg-teal-50 hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  Book Now
                </Link>
                <p className="text-center text-slate-500 text-xs mt-4">You won't be charged yet</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-7xl py-20 grid lg:grid-cols-12 gap-16">
        
        <div className="lg:col-span-8 space-y-20">
          {/* Subcategories Bento Grid */}
          {service.children && service.children.length > 0 && (
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Included Services</h2>
                <p className="text-slate-500 mt-2 text-lg">Select exactly what you need after clicking Book Now.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {service.children.map((sub: any) => (
                  <Link href="/customer/jobs/new" key={sub.id} className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/10 transition-all cursor-pointer block">
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-teal-50 transition-colors">
                        {service.icon}
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{sub.name}</h3>
                    <p className="text-teal-600 font-semibold text-sm">from ₹{service.basePrice}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* How It Works */}
          <section>
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">How Suvidhaye Works</h2>
            </div>
            <div className="space-y-6">
              {[
                { n: '1', title: 'Select Service', desc: 'Choose the exact service you need and your preferred time slot.' },
                { n: '2', title: 'Instant Match', desc: 'We assign the nearest top-rated professional to your location.' },
                { n: '3', title: 'Service Delivery', desc: 'The expert arrives, completes the job, and you pay securely.' },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 shrink-0 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                    {step.n}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-lg leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <div className="mb-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <details key={i} className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-slate-900">
                    {f.q}
                    <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 text-lg leading-relaxed">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Desktop Sticky Sidebar */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl" />
              <Zap className="w-10 h-10 text-teal-400 mb-6" />
              <h3 className="text-2xl font-black mb-4">Suvidhaye Guarantee</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                If you're not completely satisfied with the service, we'll send another professional to fix it at absolutely no cost.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-300 font-medium"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Verified Backgrounds</li>
                <li className="flex items-center gap-3 text-sm text-slate-300 font-medium"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Secure Payments</li>
                <li className="flex items-center gap-3 text-sm text-slate-300 font-medium"><CheckCircle2 className="w-4 h-4 text-teal-400" /> 24/7 Support</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
      
      <Footer />
    </div>
  );
}
