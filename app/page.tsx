'use client';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';

export default function LandingPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <PublicNav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32" style={{ background: 'var(--primary)' }}>
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest" style={{ background: 'rgba(249,115,22,0.18)', color: '#F97316' }}>
          SAME-DAY VAN DELIVERY · UK
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white max-w-3xl leading-tight tracking-tight mb-6">
          Book a vetted driver.<br /><span style={{ color: '#F97316' }}>In minutes.</span>
        </h1>
        <p className="text-lg max-w-xl mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Post a job, pay securely, and track your delivery live. Elmi connects UK businesses with trusted van drivers.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => router.push('/register?role=business')} className="px-8 py-4 rounded-2xl text-base font-bold text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>Post a job →</button>
          <button onClick={() => router.push('/register?role=driver')} className="px-8 py-4 rounded-2xl text-base font-bold text-white border-2 hover:bg-white/10 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>Become a driver</button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-extrabold text-center mb-14 tracking-tight">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '📋', title: 'Post a job', desc: 'Enter pickup, drop-off, load details and your price. Takes under 2 minutes.' },
            { icon: '🚐', title: 'Driver accepts', desc: 'A vetted driver nearby picks up your job and heads to the collection address.' },
            { icon: '📍', title: 'Track live', desc: 'Watch your delivery in real time. Get notified at every stage.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border)' }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center" style={{ background: 'var(--primary)' }}>
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to send your first delivery?</h2>
        <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>Create a free account and post your first job today.</p>
        <button onClick={() => router.push('/register?role=business')} className="px-8 py-4 rounded-2xl text-base font-bold text-white" style={{ background: 'var(--accent)' }}>Create free account →</button>
      </section>

      <Footer />
    </main>
  );
}
