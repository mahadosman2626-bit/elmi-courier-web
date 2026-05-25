'use client';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';
import { useState } from 'react';

const faqs = [
  { q: 'How quickly can I get a driver?', a: 'Most jobs are accepted within minutes. Once a driver confirms, they head straight to your collection address.' },
  { q: 'How much does it cost?', a: 'You set the price. elmi charges a 15% platform fee — the driver keeps the remaining 85%. No hidden charges, no surge pricing.' },
  { q: 'What if something goes wrong?', a: 'Every driver carries valid hire & reward insurance and goods-in-transit cover. You are protected on every delivery.' },
  { q: 'Do I need an account to post a job?', a: 'Yes — it only takes 2 minutes to create a free business account. No subscription, no setup fee.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-semibold pr-4" style={{ color: '#0F172A' }}>{q}</span>
        <span className="text-lg flex-shrink-0 transition-transform" style={{ transform: open ? 'rotate(45deg)' : 'none', color: 'var(--text-secondary)' }}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <PublicNav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28" style={{ background: 'var(--primary)' }}>
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest" style={{ background: 'rgba(249,115,22,0.18)', color: '#F97316' }}>
          SAME-DAY VAN DELIVERY · UK
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white max-w-3xl leading-tight tracking-tight mb-6">
          Book a vetted driver.<br /><span style={{ color: '#F97316' }}>In minutes.</span>
        </h1>
        <p className="text-lg max-w-xl mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Post a job, pay securely, and track your delivery live. Every driver on elmi is verified — licence, insurance, and goods-in-transit cover checked before they go live.
        </p>
        <div className="flex gap-4 flex-wrap justify-center mb-10">
          <button onClick={() => router.push('/register?role=business')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)' }}>
            Post a job →
          </button>
          <button onClick={() => router.push('/register?role=driver')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white border-2 hover:bg-white/10 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
            Become a driver
          </button>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { icon: '✅', label: 'Driving licence verified' },
            { icon: '🛡️', label: 'Hire & reward insured' },
            { icon: '📦', label: 'Goods-in-transit covered' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <span>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>How it works</p>
        <h2 className="text-3xl font-extrabold text-center mb-14 tracking-tight">From post to delivered in 3 steps</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '📋', title: 'Post a job', desc: 'Enter pickup and drop-off addresses, describe your load, set your price. Takes under 2 minutes.' },
            { step: '02', icon: '🚐', title: 'Driver accepts', desc: 'A vetted driver nearby confirms your job and heads to the collection address. You get notified instantly.' },
            { step: '03', icon: '📍', title: 'Track live', desc: 'Watch your delivery on a live map. Get notified at pickup, in transit, and on delivery.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 border relative" style={{ borderColor: 'var(--border)' }}>
              <span className="absolute top-6 right-6 text-xs font-bold" style={{ color: 'var(--accent)' }}>{f.step}</span>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vetting section */}
      <section className="py-20 px-6" style={{ background: 'var(--primary)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: '#F97316' }}>Every driver is verified</p>
          <h2 className="text-3xl font-extrabold text-center mb-4 text-white tracking-tight">We check before they deliver</h2>
          <p className="text-center mb-14 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            No unverified drivers on elmi. Every application is reviewed by our team before a driver can accept a single job.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💳', title: 'UK Driving Licence', desc: 'Valid, current licence checked and approved by our team.' },
              { icon: '🛡️', title: 'Hire & Reward Insurance', desc: 'Commercial insurance covering paid delivery work — not just social use.' },
              { icon: '📦', title: 'Goods in Transit Cover', desc: 'Your goods are protected against loss or damage on every job.' },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                <p className="text-3xl mb-3">{v.icon}</p>
                <p className="font-bold text-white mb-1">{v.title}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>Transparent pricing</p>
        <h2 className="text-3xl font-extrabold text-center mb-4 tracking-tight">You set the price. We keep it simple.</h2>
        <p className="text-center mb-14 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          No subscription fees. No hidden charges. Pay only when your delivery is completed.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {[
            { role: 'For businesses', icon: '🏪', points: ['You set the job price', '15% platform fee on completion', 'No subscription or sign-up cost', 'Pay securely via Stripe'] },
            { role: 'For drivers', icon: '🚐', points: ['Keep 85% of every job', 'Instant earnings on delivery', 'Withdraw to bank in 2–3 days', 'No subscription to drive'] },
          ].map((p) => (
            <div key={p.role} className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-3xl mb-3">{p.icon}</p>
              <p className="font-extrabold text-lg mb-4">{p.role}</p>
              <ul className="flex flex-col gap-2">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#10B981' }}>✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="py-16 px-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>Coverage</p>
          <h2 className="text-2xl font-extrabold mb-4 tracking-tight">Available across the UK</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            We are growing our driver network constantly. If there are no drivers in your area yet, check back soon.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Leicester', 'Coventry', 'Nottingham', 'Newcastle', 'Glasgow'].map((city) => (
              <span key={city} className="px-4 py-2 rounded-full text-sm font-semibold bg-white border" style={{ borderColor: 'var(--border)', color: '#0F172A' }}>
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Driver recruitment */}
      <section className="py-20 px-6" style={{ background: 'var(--primary)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest" style={{ background: 'rgba(249,115,22,0.18)', color: '#F97316' }}>
            FOR DRIVERS
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Drive on your terms.</h2>
          <p className="text-lg mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Choose your own hours. Accept only the jobs you want. Get paid instantly on delivery.
          </p>
          <p className="text-2xl font-extrabold mb-10" style={{ color: '#F97316' }}>Keep 85% of every job.</p>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '⏰', title: 'Your schedule', desc: 'Go online when you want. No minimum hours, no shifts.' },
              { icon: '💷', title: 'Instant payouts', desc: 'Earnings credited the moment you mark a job delivered.' },
              { icon: '📱', title: 'App + web', desc: 'Manage everything from the elmi app or this website.' },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl p-5 text-left border" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                <p className="text-2xl mb-2">{b.icon}</p>
                <p className="font-bold text-white mb-1 text-sm">{b.title}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/register?role=driver')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white"
            style={{ background: 'var(--accent)' }}>
            Apply to drive →
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-3xl mx-auto w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>FAQ</p>
        <h2 className="text-3xl font-extrabold text-center mb-10 tracking-tight">Common questions</h2>
        <div className="bg-white rounded-2xl border overflow-hidden mb-6" style={{ borderColor: 'var(--border)' }}>
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          More questions?{' '}
          <a href="/faq" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>See the full FAQ</a>
          {' '}or{' '}
          <a href="/contact" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>contact us</a>.
        </p>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center" style={{ background: 'var(--primary)' }}>
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to send your first delivery?</h2>
        <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>Create a free account and post your first job today. No subscription required.</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => router.push('/register?role=business')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white"
            style={{ background: 'var(--accent)' }}>
            Create free account →
          </button>
          <button onClick={() => router.push('/login')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white border-2 hover:bg-white/10 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
            Sign in
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
