'use client';
import { useRouter } from 'next/navigation';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { useState } from 'react';

const driverFaqs = [
  { q: 'How much can I earn?', a: 'You keep 88% of every job price. On a typical day with 3–5 jobs, drivers earn between £80 and £250. High-urgency or long-distance jobs pay significantly more — you see the price before you accept.' },
  { q: 'How quickly can I start?', a: 'Create your account today. Once you submit your documents (licence, H&R insurance, GIT certificate), our team reviews them — usually within 24 hours. After approval you can go live and start accepting jobs immediately.' },
  { q: 'Do I need my own customers?', a: 'No. Elmi brings the jobs to you. Businesses post jobs on the platform and you choose which ones to accept based on location, price, and load.' },
  { q: 'When do I get paid?', a: 'The moment you mark a job as delivered, your earnings are credited to your Elmi balance. Withdraw to your bank account anytime — funds arrive in 1–2 business days via Stripe.' },
  { q: 'What documents do I need?', a: 'A valid UK driving licence, hire & reward insurance (covering paid delivery work), and a goods-in-transit certificate. If you don\'t have H&R or GIT cover yet, we can point you to providers.' },
  { q: 'Can I do this alongside another job?', a: 'Yes. You set your own hours. Go online when you want, offline when you don\'t. There are no minimum hours, no shifts, and no penalties for taking time off.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        style={{ background: 'transparent' }}>
        <span className="text-sm font-semibold pr-4 text-white">{q}</span>
        <span className="text-lg flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(45deg)' : 'none', color: '#F97316' }}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-4">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function DriversPage() {
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
          FOR DRIVERS &middot; UK
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white max-w-3xl leading-[1.08] tracking-tight mb-6">
          Drive when you want.<br /><span style={{ color: '#F97316' }}>Keep what you earn.</span>
        </h1>
        <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Join Elmi and get paid to deliver with your van. You set your own hours, choose your jobs, and keep 88% of every delivery — credited the moment you drop off.
        </p>
        <button onClick={() => router.push('/register?role=driver')}
          className="px-10 py-4 rounded-2xl text-base font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
          style={{ background: 'var(--accent)' }}>
          Apply to drive &rarr;
        </button>
        <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Free to join · No subscription · Start within 24 hours</p>
      </section>

      {/* Earnings highlight */}
      <section className="py-14 px-6" style={{ background: '#F1F5F9' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '88%', label: 'Of every job is yours' },
            { value: '£200+', label: 'Possible on a full day' },
            { value: '24h', label: 'Typical approval time' },
            { value: '0', label: 'Monthly subscription fee' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>{s.value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: '#64748B' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>Getting started</p>
        <h2 className="text-3xl font-extrabold text-center mb-4 tracking-tight">On the road in 3 steps</h2>
        <p className="text-center mb-14 max-w-lg mx-auto text-sm" style={{ color: 'var(--text-secondary)' }}>
          No lengthy onboarding. Submit your documents, get approved, and start earning.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '📱', title: 'Create your account', desc: 'Sign up free in under 2 minutes. Choose driver when registering. No subscription or upfront fee.' },
            { step: '02', icon: '📋', title: 'Submit your documents', desc: 'Upload your driving licence, hire & reward insurance, and goods-in-transit certificate. Our team reviews within 24 hours.' },
            { step: '03', icon: '💷', title: 'Accept jobs & get paid', desc: 'Go online, browse available jobs near you, accept the ones you want, and get paid the moment you deliver.' },
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

      {/* Earnings example */}
      <section className="py-20 px-6" style={{ background: '#0F172A' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: '#F97316' }}>Earnings</p>
          <h2 className="text-3xl font-extrabold text-center mb-4 text-white tracking-tight">What does a day look like?</h2>
          <p className="text-center mb-12 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Example based on 4 jobs in a working day. Prices are set by businesses — you see the amount before you accept.
          </p>
          <div className="flex flex-col gap-3 mb-8">
            {[
              { route: 'Bristol city centre → Clifton', load: 'Office furniture', price: 45, yours: 39.60 },
              { route: 'Filton → Bath city centre', load: 'Catering supplies', price: 65, yours: 57.20 },
              { route: 'Bedminster → Weston-super-Mare', load: 'Retail stock', price: 90, yours: 79.20 },
              { route: 'Bristol BS1 → Swindon', load: 'Trade tools', price: 120, yours: 105.60 },
            ].map((job, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl px-5 py-4 gap-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{job.route}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{job.load}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Job price £{job.price}</p>
                  <p className="text-base font-extrabold" style={{ color: '#F97316' }}>You keep £{job.yours.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl px-6 py-5 flex items-center justify-between"
            style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <div>
              <p className="text-sm font-bold text-white">4 jobs · estimated day total</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>88% of £320 job value</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: '#F97316' }}>£281.60</p>
          </div>
        </div>
      </section>

      {/* What you need */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full">
        <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>Requirements</p>
        <h2 className="text-3xl font-extrabold text-center mb-4 tracking-tight">What you need to apply</h2>
        <p className="text-center mb-14 max-w-lg mx-auto text-sm" style={{ color: 'var(--text-secondary)' }}>
          We verify every driver before they go live. It protects your customers and it protects you.
        </p>
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {[
            { icon: '🚐', title: 'Your own van', desc: 'Any van size — small, medium, or luton. Must be roadworthy with a valid MOT.' },
            { icon: '💳', title: 'UK driving licence', desc: 'Full UK driving licence. Our team reviews a photo of the front and back.' },
            { icon: '🛡️', title: 'Hire & reward insurance', desc: 'Commercial insurance that covers paid delivery work. Standard social, domestic & pleasure cover isn\'t enough.' },
            { icon: '📦', title: 'Goods in transit cover', desc: 'GIT insurance protects the customer\'s goods while in your care. Required for all Elmi drivers.' },
          ].map((r) => (
            <div key={r.title} className="bg-white rounded-2xl p-6 border flex gap-4"
              style={{ borderColor: 'var(--border)' }}>
              <span className="text-3xl flex-shrink-0">{r.icon}</span>
              <div>
                <p className="font-bold text-sm mb-1">{r.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
          Don&apos;t have H&R or GIT cover yet?{' '}
          <a href="mailto:support@elmicouriers.co.uk" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Contact us
          </a>{' '}
          and we&apos;ll point you to providers.
        </p>
      </section>

      {/* Why Elmi */}
      <section className="py-20 px-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>Why Elmi</p>
          <h2 className="text-3xl font-extrabold text-center mb-14 tracking-tight">Built to be fair to drivers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💷', title: 'Highest driver cut', desc: 'We take 12% — that\'s it. Most courier platforms take 20–40%. You earn more per job with Elmi.' },
              { icon: '⏰', title: 'Total flexibility', desc: 'Go online Monday morning. Go offline Tuesday. No minimum hours, no account penalties, no roster.' },
              { icon: '📲', title: 'Simple, fast app', desc: 'Accept jobs in one tap, navigate to pickup, mark delivered, get paid. No complicated dashboards.' },
              { icon: '🔒', title: 'Secure payments', desc: 'Every business pays through Stripe before the job goes live. Your earnings are guaranteed before you drive.' },
              { icon: '📞', title: 'Real support', desc: 'Questions or problems on a job? Our team is reachable by email. No bots, no phone trees.' },
              { icon: '🚀', title: 'Growing fast', desc: 'More businesses join every week. More jobs means more choice for drivers — and more earning potential.' },
            ].map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                <p className="text-3xl mb-3">{b.icon}</p>
                <p className="font-bold text-sm mb-1">{b.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: '#0F172A' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: '#F97316' }}>FAQ</p>
          <h2 className="text-3xl font-extrabold text-center mb-10 text-white tracking-tight">Driver questions</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {driverFaqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
          <p className="text-center text-sm mt-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            More questions?{' '}
            <a href="mailto:support@elmicouriers.co.uk" className="font-semibold hover:underline" style={{ color: '#F97316' }}>
              support@elmicouriers.co.uk
            </a>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#F97316' }}>Ready to earn?</p>
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Start driving with Elmi.</h2>
        <p className="mb-3 text-lg max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Free to join. Approved in 24 hours. Keep 88% of every job.
        </p>
        <p className="text-2xl font-extrabold mb-10" style={{ color: '#F97316' }}>£281.60 in a day — why not?</p>
        <button onClick={() => router.push('/register?role=driver')}
          className="px-10 py-4 rounded-2xl text-base font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
          style={{ background: 'var(--accent)' }}>
          Apply to drive &rarr;
        </button>
        <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>No subscription · No upfront cost · Cancel anytime</p>
      </section>

      <Footer />
    </main>
  );
}
