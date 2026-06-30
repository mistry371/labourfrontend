import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-teal-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
           <div className="absolute top-1/4 -right-24 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-6 tracking-tight">
            Elevating <span className="text-green-600">Home & IT Services</span> to the Next Level
          </h1>
          <p className="text-xl text-teal-800/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            Suvidhaye connects you with top-tier, verified professionals for all your tech and home needs. We believe in transparency, speed, and uncompromising quality.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-green-600 uppercase tracking-widest">Our Mission</h2>
            <h3 className="text-4xl font-black text-gray-900 leading-tight">
              To make reliable services accessible to everyone, instantly.
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Finding a trustworthy technician shouldn't be a gamble. We built Suvidhaye to bring the same level of professional standardization seen in ridesharing to the world of specialized home and IT services. 
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every professional on our platform passes rigorous background checks, skill tests, and continuous rating evaluations to ensure you only get the best.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-teal-100 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-green-500/20 mix-blend-overlay"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image src="/images/tools_3d_icon.png" alt="3D tools icon" width={400} height={400} className="object-contain" />
              </div>
            </div>
            
            {/* Floating stat cards */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-float">
              <p className="text-4xl font-black text-teal-600">50k+</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-1">Happy Customers</p>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
              <p className="text-4xl font-black text-green-600">4.8</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Choose Suvidhaye?</h2>
            <p className="text-gray-600 text-lg">We stand out by prioritizing quality, transparency, and speed in an industry known for unpredictability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🛡️',
                title: 'Verified Professionals',
                desc: 'Every worker undergoes a strict Aadhaar KYC and background verification process.'
              },
              {
                icon: '💸',
                title: 'Transparent Pricing',
                desc: 'No hidden fees or surprise charges. See the upfront estimated cost before booking.'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                desc: 'Book a service in seconds and have a professional at your doorstep within hours.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all duration-300 group">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to experience the difference?</h2>
          <p className="text-xl text-teal-100 mb-10">
            Join thousands of satisfied customers who trust Suvidhaye for their home and IT needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="bg-green-500 hover:bg-green-400 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg shadow-green-500/30">
              Explore Services
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-md transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
