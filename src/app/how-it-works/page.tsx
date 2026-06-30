import Link from 'next/link';
import PublicNav from '@/components/layout/PublicNav';

const CUSTOMER_STEPS = [
  { n: '01', icon: '📱', title: 'Download & Sign Up', desc: 'Create your account in 30 seconds with just your phone number.' },
  { n: '02', icon: '🔍', title: 'Choose a Service', desc: 'Browse 50+ services and select exactly what you need.' },
  { n: '03', icon: '📅', title: 'Pick a Time Slot', desc: 'Choose a convenient time — same day or schedule in advance.' },
  { n: '04', icon: '✅', title: 'Confirm & Pay', desc: 'Confirm your booking and pay securely via Razorpay.' },
  { n: '05', icon: '🚗', title: 'Worker Arrives', desc: 'Track your worker in real-time as they head to your location.' },
  { n: '06', icon: '⭐', title: 'Rate & Review', desc: 'Job done! Rate your experience and help others choose.' },
];

const WORKER_STEPS = [
  { n: '01', icon: '📝', title: 'Apply Online', desc: 'Fill out a simple form with your skills and experience.' },
  { n: '02', icon: '🪪', title: 'KYC Verification', desc: 'Upload your ID and get verified within 24 hours.' },
  { n: '03', icon: '📚', title: 'Training', desc: 'Complete our quick online training module.' },
  { n: '04', icon: '📲', title: 'Get Jobs', desc: 'Start receiving job requests in your area instantly.' },
  { n: '05', icon: '💼', title: 'Complete Jobs', desc: 'Do great work and build your reputation.' },
  { n: '06', icon: '💰', title: 'Get Paid', desc: 'Earnings credited to your wallet within 24 hours.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="bg-hero py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-green-500 rounded-full blur-3xl animate-blob" />
        </div>
        <div className="relative z-10">
          <span className="badge badge-green mb-4">Simple Process</span>
          <h1 className="text-5xl font-black text-white mb-4">How Suvidhaye Works</h1>
          <p className="text-teal-200/70 text-xl max-w-xl mx-auto">From booking to completion in minutes. Here's how it works for customers and workers.</p>
        </div>
      </div>

      <div className="section container">
        <div className="text-center mb-12">
          <span className="badge badge-green mb-3">For Customers</span>
          <h2 className="text-3xl font-black text-teal-800">Book a Service in 6 Steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {CUSTOMER_STEPS.map((s, i) => (
            <div key={s.n} className={`card-premium p-6 animate-slide-up delay-${(i%3+1)*100}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center text-2xl shadow-green">{s.icon}</div>
                <span className="text-3xl font-black text-green-100">{s.n}</span>
              </div>
              <h3 className="font-bold text-teal-800 mb-2">{s.title}</h3>
              <p className="text-sm text-teal-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="divider mb-16" />

        <div className="text-center mb-12">
          <span className="badge badge-teal mb-3">For Workers</span>
          <h2 className="text-3xl font-black text-teal-800">Start Earning in 6 Steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {WORKER_STEPS.map((s, i) => (
            <div key={s.n} className={`card-premium p-6 animate-slide-up delay-${(i%3+1)*100}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center text-2xl shadow-teal">{s.icon}</div>
                <span className="text-3xl font-black text-teal-100">{s.n}</span>
              </div>
              <h3 className="font-bold text-teal-800 mb-2">{s.title}</h3>
              <p className="text-sm text-teal-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-hero py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-8">Ready to Get Started?</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/login" className="btn btn-primary btn-xl">Book a Service →</Link>
          <Link href="/become-worker" className="btn btn-xl border-2 border-white/30 text-white hover:bg-white/10">Become a Worker</Link>
        </div>
      </div>
    </div>
  );
}
