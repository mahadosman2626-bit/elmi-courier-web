'use client';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <PublicNav />

      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: 'var(--primary)' }}>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">About elmi</h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
          We're building the UK's most trusted courier marketplace — connecting businesses with professional van drivers.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-10 flex-1">

        {/* Mission */}
        <div className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-extrabold mb-3">Our mission</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            elmi was built to make courier booking as simple as possible for UK businesses. Whether you need to move stock between warehouses, deliver to a customer, or send urgent documents across town — we connect you with a vetted, insured driver in minutes. No phone calls, no spreadsheets, no chasing. Just post, pay, and track.
          </p>
        </div>

        {/* How it started */}
        <div className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-extrabold mb-3">How it started</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            elmi was founded after seeing how fragmented and frustrating courier delivery was for small and medium businesses in the UK. Existing platforms were expensive, slow, or designed for enterprise clients. We built elmi from the ground up to be fast, transparent, and fair — for both businesses and drivers.
          </p>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-xl font-extrabold mb-5">What we stand for</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '🤝', title: 'Fairness', desc: 'Drivers keep 85% of every job. No surge pricing, no hidden fees.' },
              { icon: '🔒', title: 'Trust', desc: 'Every driver is verified with licence, insurance, and GIT certificate checks.' },
              { icon: '⚡', title: 'Speed', desc: 'Post a job in under 2 minutes. Drivers respond in real time.' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                <p className="text-3xl mb-3">{v.icon}</p>
                <p className="font-bold mb-1">{v.title}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-extrabold mb-3">Get in touch</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            We're a small team that genuinely cares. If you have a question, a problem, or an idea — we want to hear from you.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <p><span className="font-semibold">General enquiries:</span> <a href="mailto:hello@elmicouriers.co.uk" className="hover:underline" style={{ color: 'var(--primary)' }}>hello@elmicouriers.co.uk</a></p>
            <p><span className="font-semibold">Driver support:</span> <a href="mailto:drivers@elmicouriers.co.uk" className="hover:underline" style={{ color: 'var(--primary)' }}>drivers@elmicouriers.co.uk</a></p>
            <p><span className="font-semibold">Business support:</span> <a href="mailto:support@elmicouriers.co.uk" className="hover:underline" style={{ color: 'var(--primary)' }}>support@elmicouriers.co.uk</a></p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
