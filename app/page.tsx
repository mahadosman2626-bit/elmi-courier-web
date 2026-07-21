'use client';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';
import { useState } from 'react';

const faqs = [
  { q: 'How quickly can I get a driver?', a: 'Most jobs are accepted within minutes of posting. Once a driver confirms, they head straight to your collection address.' },
  { q: 'How much does it cost?', a: 'You set the price. Elmi charges a 12% platform fee — drivers keep 88%. No hidden charges, no surge pricing, no subscription.' },
  { q: 'What if something goes wrong?', a: 'Every driver carries valid hire & reward insurance and goods-in-transit cover, verified by our team before they go live. Your goods are protected on every delivery.' },
  { q: 'Do I need an account to post a job?', a: 'Yes — it only takes 2 minutes to create a free business account. No subscription, no setup fee. Pay only when your job is completed.' },
  { q: 'How are drivers vetted?', a: 'Every driver submits a copy of their driving licence, hire & reward insurance, and goods-in-transit certificate. Our team reviews and approves each document before the driver can accept any jobs.' },
  { q: 'Can I track the delivery live?', a: 'Yes. Share a live tracking link with whoever needs to receive the delivery. They can follow progress in real time without needing an account.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-semibold pr-4" style={{ color: '#0F172A' }}>{q}</span>
        <span className="text-lg flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(45deg)' : 'none', color: 'var(--text-secondary)' }}>+</span>
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
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20"
        style={{ background: 'linear-gradient(170deg, #0B1628 0%, #0F172A 50%, #1A2E4A 100%)' }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8 tracking-widest"
          style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
          TRUSTED DELIVERY &middot; UK
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white max-w-3xl leading-[1.08] tracking-tight mb-6">
          A real driver.<br />A real van.<br /><span style={{ color: '#F97316' }}>Trusted.</span>
        </h1>
        <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Post a job, pay securely, and track your delivery live. Every driver on Elmi is verified — licence, insurance, and goods-in-transit cover checked before they go live.
        </p>
        <div className="flex gap-4 flex-wrap justify-center mb-12">
          <button onClick={() => router.push('/register?role=business')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
            style={{ background: 'var(--accent)' }}>
            Post a job &rarr;
          </button>
          <button onClick={() => router.push('/register?role=driver')}
            className="px-8 py-4 rounded-2xl text-base font-bold hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
            Become a driver
          </button>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', maxWidth: '32rem' }}>
          {[
            { icon: '✅', label: 'Licence verified' },
            { icon: '🛡️', label: 'Hire & reward insured' },
            { icon: '📦', label: 'Goods-in-transit covered' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 px-6" style={{ background: '#F1F5F9' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '2 min', label: 'Average time to post a job' },
            { value: '88%', label: 'Of every job goes to the driver' },
            { value: '100%', label: 'Of drivers manually verified' },
            { value: 'Live', label: 'Real-time delivery tracking' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>{s.value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: '#64748B' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>How it works</p>
        <h2 className="text-3xl font-extrabold text-center mb-4 tracking-tight">From post to delivered in 3 steps</h2>
        <p className="text-center mb-14 max-w-lg mx-auto text-sm" style={{ color: 'var(--text-secondary)' }}>
          No phone calls, no waiting around. Post your job online and a driver comes to you.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '📋', title: 'Post a job', desc: 'Enter pickup and drop-off addresses, describe your load, and set your price. Takes under 2 minutes.' },
            { step: '02', icon: '🚐', title: 'Driver accepts', desc: 'A vetted driver nearby confirms your job and heads to the collection address. You get notified instantly.' },
            { step: '03', icon: '📍', title: 'Track live', desc: 'Get real-time updates at pickup, in transit, and on delivery. Share a live link with your recipient.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 border relative hover:shadow-sm transition-shadow"
              style={{ borderColor: 'var(--border)' }}>
              <span className="absolute top-6 right-6 text-xs font-bold" style={{ color: 'var(--accent)' }}>{f.step}</span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                style={{ background: '#F1F5F9' }}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vetting section */}
      <section className="py-20 px-6" style={{ background: '#0F172A' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: '#F97316' }}>Driver verification</p>
          <h2 className="text-3xl font-extrabold text-center mb-4 text-white tracking-tight">We check before they deliver</h2>
          <p className="text-center mb-14 max-w-xl mx-auto text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No self-reported info. Every document is reviewed and approved by our team before a driver can accept their first job.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '💳', title: 'UK Driving Licence', desc: 'Valid, current licence checked and confirmed by our team. No expired or foreign licences.' },
              { icon: '🛡️', title: 'Hire & Reward Insurance', desc: 'Commercial insurance covering paid delivery work — not just social use cover.' },
              { icon: '📦', title: 'Goods in Transit Cover', desc: 'Your goods are protected against loss or damage on every single delivery.' },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-3xl mb-4">{v.icon}</p>
                <p className="font-bold text-white mb-1 text-sm">{v.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>Transparent pricing</p>
        <h2 className="text-3xl font-extrabold text-center mb-4 tracking-tight">You set the price. We keep it simple.</h2>
        <p className="text-center mb-14 max-w-xl mx-auto text-sm" style={{ color: 'var(--text-secondary)' }}>
          No subscription fees. No hidden charges. Pay only when your delivery is completed.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {[
            {
              role: 'For businesses',
              icon: '🏪',
              color: '#1E3A8A',
              points: ['You set the job price', '12% platform fee on completion', 'No subscription or sign-up cost', 'Secure payment via Stripe'],
            },
            {
              role: 'For drivers',
              icon: '🚐',
              color: '#F97316',
              points: ['Keep 88% of every job', 'Earnings credited on delivery', 'Withdraw to bank in 1–2 days', 'No subscription to start driving'],
            },
          ].map((p) => (
            <div key={p.role} className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: p.color + '12' }}>
                {p.icon}
              </div>
              <p className="font-extrabold text-base mb-4">{p.role}</p>
              <ul className="flex flex-col gap-2.5">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-bold mt-0.5" style={{ color: '#10B981' }}>&#10003;</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-xs mt-6" style={{ color: '#94A3B8' }}>
          Example: a £50 job &rarr; driver earns £44, Elmi keeps £6. That&apos;s it.
        </p>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>Social proof</p>
          <h2 className="text-3xl font-extrabold text-center mb-12 tracking-tight">Businesses that ship with Elmi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "We moved our whole weekly distribution over to Elmi. The drivers turn up on time and the live tracking means our customers always know where their order is.",
                name: "James R.",
                role: "Operations Manager",
                company: "Bristol Kitchens Ltd",
                initial: "J",
              },
              {
                quote: "Used three different courier apps before this. Elmi is the only one where I can actually see the driver is insured before I hand over the goods.",
                name: "Priya M.",
                role: "Founder",
                company: "PM Florals, Birmingham",
                initial: "P",
              },
              {
                quote: "Posted my first job at 9am, driver picked up at 9:22. That's it. I don't have time to chase couriers — Elmi just works.",
                name: "Dan W.",
                role: "Director",
                company: "Westfield Supplies, Manchester",
                initial: "D",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border flex flex-col gap-4"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ color: '#FCD34D', fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#374151' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'var(--primary)' }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-16 px-6" style={{ background: '#F1F5F9' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>Coverage</p>
          <h2 className="text-2xl font-extrabold mb-3 tracking-tight">Available across the UK</h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            We are growing our driver network constantly. If there are no drivers in your area yet, post a job and we&apos;ll match you as soon as one comes online.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Leicester', 'Coventry', 'Nottingham', 'Newcastle', 'Glasgow'].map((city) => (
              <span key={city} className="px-4 py-2 rounded-full text-sm font-semibold bg-white border"
                style={{ borderColor: 'var(--border)', color: '#0F172A' }}>
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Driver recruitment */}
      <section id="for-drivers" className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest"
            style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)' }}>
            FOR DRIVERS
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Drive on your terms.</h2>
          <p className="text-lg mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Choose your own hours. Accept only the jobs you want. Get paid instantly on delivery.
          </p>
          <p className="text-3xl font-extrabold mb-10" style={{ color: '#F97316' }}>Keep 88% of every job.</p>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '⏰', title: 'Your schedule', desc: 'Go online when you want. No minimum hours, no shifts, no fixed routes.' },
              { icon: '💷', title: 'Instant payouts', desc: 'Earnings credited the moment you mark a job delivered. Withdraw anytime.' },
              { icon: '📱', title: 'App + web', desc: 'Manage everything from the Elmi mobile app or this website.' },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl p-5 text-left"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-2xl mb-3">{b.icon}</p>
                <p className="font-bold text-white mb-1 text-sm">{b.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/register?role=driver')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)' }}>
            Apply to drive &rarr;
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
          <a href="mailto:support@elmicouriers.co.uk" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Contact support
          </a>
        </p>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center" style={{ background: '#0F172A' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#F97316' }}>Get started today</p>
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Ready to ship?</h2>
        <p className="mb-10 text-lg max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Create a free account and post your first job. No subscription, no setup fee.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => router.push('/register?role=business')}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
            style={{ background: 'var(--accent)' }}>
            Post your first job &rarr;
          </button>
          <button onClick={() => router.push('/login')}
            className="px-8 py-4 rounded-2xl text-base font-bold hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
            Sign in
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
