'use client';
import { useState } from 'react';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';

const faqs = [
  {
    category: 'For Businesses',
    items: [
      {
        q: 'How do I post a job?',
        a: 'Create a free business account, click "Post a job", enter your pickup and drop-off addresses, describe the load, choose a van size, set your price, and submit. Nearby drivers are notified immediately.',
      },
      {
        q: 'How is the price set?',
        a: 'You set the price you are willing to pay. elmi keeps a 15% platform fee, and the driver receives the remaining 85%. There are no hidden charges.',
      },
      {
        q: 'How are drivers vetted?',
        a: 'Every driver must upload a valid UK driving licence, hire & reward insurance, and a goods-in-transit (GIT) certificate. Our admin team reviews and approves each document before the driver can accept jobs.',
      },
      {
        q: 'Can I track my delivery?',
        a: 'Yes — once a driver accepts your job, you can track their location live through the app or on this website. You also receive notifications at every status change.',
      },
      {
        q: 'What if I need to cancel?',
        a: 'You can cancel a job at any time before delivery from the job detail page. Please note that repeated cancellations after a driver has been assigned may affect your account.',
      },
      {
        q: 'Is payment secure?',
        a: 'Yes. All payments are processed by Stripe, one of the world\'s most trusted payment providers. We never store your card details.',
      },
    ],
  },
  {
    category: 'For Drivers',
    items: [
      {
        q: 'How do I sign up as a driver?',
        a: 'Download the elmi app or register on this website, choose "Driver" as your role, and submit your documents (driving licence, insurance, GIT certificate). Once approved by our team, you can start accepting jobs.',
      },
      {
        q: 'How much do I earn?',
        a: 'You keep 85% of every job\'s total price. Your earnings are credited to your elmi account on delivery and can be withdrawn to your bank account via Stripe.',
      },
      {
        q: 'When do I get paid?',
        a: 'Earnings are credited instantly when you mark a job as delivered. Withdrawals to your linked bank account take 2–3 business days via Stripe.',
      },
      {
        q: 'Do I need goods-in-transit insurance?',
        a: 'Yes. A valid GIT insurance certificate is required to be approved as a driver on elmi. This protects both you and the businesses you work with.',
      },
      {
        q: 'Can I choose which jobs I take?',
        a: 'Absolutely. You only see jobs when you are online, and you choose which ones to accept. There is no obligation to take any particular job.',
      },
      {
        q: 'What if a business cancels on me?',
        a: 'If a business cancels after you have accepted, you will be notified immediately and the job will be removed from your queue. We are working on a cancellation policy to compensate drivers for last-minute cancellations.',
      },
    ],
  },
  {
    category: 'General',
    items: [
      {
        q: 'Which areas does elmi cover?',
        a: 'elmi is currently available across the UK. We are growing our driver network constantly — if there are no drivers in your area yet, check back soon.',
      },
      {
        q: 'Is there a mobile app?',
        a: 'Yes — elmi is available as a mobile app for both businesses and drivers. Search for "elmi courier" on the Google Play Store, or use this website.',
      },
      {
        q: 'How do I contact support?',
        a: 'Email us at support@elmicourier.co.uk or use the Support option in your profile. We aim to respond within 24 hours on business days.',
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-semibold pr-4" style={{ color: '#0F172A' }}>{q}</span>
        <span className="text-lg flex-shrink-0 transition-transform" style={{ transform: open ? 'rotate(45deg)' : 'none', color: 'var(--text-secondary)' }}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <PublicNav />

      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: 'var(--primary)' }}>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">Frequently asked questions</h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Everything you need to know about elmi. Can't find the answer? <a href="mailto:support@elmicourier.co.uk" className="underline text-white">Drop us an email.</a>
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-10 flex-1 w-full">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              {section.category}
            </h2>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {section.items.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl p-8 border text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-2xl mb-3">💬</p>
          <h3 className="font-bold mb-2">Still have questions?</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Our team is happy to help.</p>
          <a href="mailto:support@elmicourier.co.uk"
            className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold"
            style={{ background: 'var(--primary)' }}>
            Email support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
