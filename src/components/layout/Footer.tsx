'use client';
import Link from 'next/link';

const FOOTER_LINKS = {
  'Hardware Support': [
    'Laptop Repair', 'Desktop Repair', 'Printer Repair',
    'Gaming PC Customization', 'Motherboard Repair',
  ],
  'Network & Security': [
    'CCTV Installation', 'Networking Setup', 'Server Setup',
    'Smart Home Setup', 'Data Recovery',
  ],
  'Company': [
    ['About Us', '/about'],
    ['How It Works', '/how-it-works'],
    ['Careers', '#'],
    ['Press', '#'],
  ],
  'Support': [
    ['Help Center', '#'],
    ['Contact Us', '#'],
    ['Privacy Policy', '#'],
    ['Terms of Service', '#'],
    ['Refund Policy', '#'],
    ['Become a Worker', '/become-worker'],
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: '#0a1a24' }} className="text-white">
      {/* Top CTA strip */}
      <div style={{ background: 'linear-gradient(135deg,#1a4a2e,#1b3a4b)' }} className="py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-white mb-1">Ready to book a service?</h3>
            <p className="text-white/60 text-sm">Verified workers, transparent pricing, 30-min response</p>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="btn btn-primary">Book Now →</Link>
            <Link href="/become-worker" className="btn border-2 border-white/20 text-white hover:bg-white/10">Join as Worker</Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-green">
                <span className="text-white font-black text-sm">SV</span>
              </div>
              <span className="font-black text-xl">
                <span className="text-white">Suvi</span>
                <span className="text-green-400">dhaye</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              India's most trusted on-demand home & IT services platform. Verified workers, transparent pricing, guaranteed quality.
            </p>
            <div className="flex gap-2 mb-5">
              {[
                { icon: '📘', label: 'Facebook' },
                { icon: '🐦', label: 'Twitter' },
                { icon: '📸', label: 'Instagram' },
                { icon: '▶️', label: 'YouTube' },
              ].map(s => (
                <button key={s.label} aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(92,184,92,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  {s.icon}
                </button>
              ))}
            </div>
            {/* App badges */}
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/70 cursor-pointer hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>
                📱 App Store
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/70 cursor-pointer hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>
                🤖 Play Store
              </div>
            </div>
          </div>

          {/* Hardware Support */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Hardware Support</h4>
            <ul className="space-y-2.5">
              {(FOOTER_LINKS['Hardware Support'] as string[]).map(l => (
                <li key={l}>
                  <Link href="/services" className="text-white/50 text-sm hover:text-green-400 transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Network & Security */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Network & Security</h4>
            <ul className="space-y-2.5">
              {(FOOTER_LINKS['Network & Security'] as string[]).map(l => (
                <li key={l}>
                  <Link href="/services" className="text-white/50 text-sm hover:text-green-400 transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {(FOOTER_LINKS['Company'] as [string, string][]).map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="text-white/50 text-sm hover:text-green-400 transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              {(FOOTER_LINKS['Support'] as [string, string][]).map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="text-white/50 text-sm hover:text-green-400 transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© 2026 Suvidhaye Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>🔒 SSL Secured</span>
            <span>✅ ISO 27001</span>
            <span>🇮🇳 Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
