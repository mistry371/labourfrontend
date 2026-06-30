import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import PublicNav from '@/components/layout/PublicNav';

const BENEFITS = [
  { icon: '💰', title: 'Earn ₹30,000+/month', desc: 'Top workers earn over ₹50,000 monthly on flexible schedules' },
  { icon: '⏰', title: 'Work Your Hours', desc: 'Set your own availability. Work mornings, evenings, or weekends' },
  { icon: '📱', title: 'Easy App', desc: 'Simple app to manage jobs, track earnings, and get support' },
  { icon: '🛡️', title: 'Insurance Cover', desc: 'Work with confidence — accident insurance included' },
  { icon: '📈', title: 'Grow Your Career', desc: 'Level up, earn badges, and unlock premium job opportunities' },
  { icon: '💳', title: 'Instant Payments', desc: 'Earnings credited to your wallet within 24 hours of job completion' },
];

const FAQS = [
  { q: 'What skills do I need?', a: 'We accept plumbers, electricians, cleaners, carpenters, painters, AC technicians, and more. Any home service skill qualifies.' },
  { q: 'How long does verification take?', a: 'KYC verification typically takes 24-48 hours after you submit your documents.' },
  { q: 'How do I get paid?', a: 'Earnings are credited to your Suvidhaye wallet after each job. You can withdraw to your bank account anytime.' },
  { q: 'Is there a minimum job requirement?', a: 'No minimum. Work as much or as little as you want.' },
];

export default function BecomeWorkerPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <div className="bg-hero py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-500 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-400 rounded-full blur-3xl animate-blob anim-delay-300" />
        </div>
        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge badge-green mb-4">8,000+ Workers Earning</span>
            <h1 className="text-5xl font-black text-white mb-6 leading-tight">
              Turn Your Skills Into<br /><span className="text-gradient">₹30,000+/Month</span>
            </h1>
            <p className="text-teal-200/80 text-lg mb-8 leading-relaxed">Join India's fastest-growing home services platform. Work on your schedule, earn great income, and build a career you're proud of.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login?role=worker" className="btn btn-primary btn-xl animate-pulse-green">Apply Now — It's Free →</Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-8">
              {['✅ Free to Join', '⚡ Start in 48hrs', '💰 Weekly Payouts'].map(t => (
                <span key={t} className="text-teal-200/70 text-sm font-medium">{t}</span>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="card p-6 rounded-3xl max-w-sm mx-auto animate-float">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 bg-brand-green rounded-2xl flex items-center justify-center text-2xl shadow-green">👷</div>
                <div>
                  <p className="font-black text-teal-800">Ramesh Kumar</p>
                  <p className="text-sm text-teal-500">Electrician · 3 years</p>
                </div>
                <span className="ml-auto badge badge-gold">💎 Elite</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[['₹42,800', 'This Month'], ['156', 'Total Jobs'], ['4.9★', 'Rating'], ['Top 3%', 'Ranking']].map(([v, l]) => (
                  <div key={l} className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="font-black text-green-700 text-lg">{v}</div>
                    <div className="text-xs text-teal-500">{l}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-teal-400 text-center italic">"Suvidhaye changed my life. I earn 3x more than before."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="section container">
        <div className="text-center mb-12">
          <span className="badge badge-green mb-3">Why Suvidhaye</span>
          <h2 className="text-4xl font-black text-teal-800">Everything You Need to Succeed</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <div key={b.title} className={`card-premium p-6 animate-slide-up delay-${(i%3+1)*100}`}>
              <div className="w-14 h-14 bg-brand-green rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-green">{b.icon}</div>
              <h3 className="font-bold text-teal-800 mb-2">{b.title}</h3>
              <p className="text-sm text-teal-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="section-sm bg-green-50/50">
        <div className="container-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-teal-800">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(f => (
              <div key={f.q} className="card p-5">
                <h3 className="font-bold text-teal-800 mb-2">❓ {f.q}</h3>
                <p className="text-sm text-teal-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-hero py-16 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Ready to Start Earning?</h2>
        <p className="text-teal-200/70 text-lg mb-8">Join 8,000+ workers already earning on Suvidhaye</p>
        <Link href="/login?role=worker" className="btn btn-primary btn-xl animate-pulse-green">Apply Now — Free →</Link>
      </div>
      <Footer />
    </div>
  );
}
