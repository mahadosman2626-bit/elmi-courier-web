'use client';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

const sections = [
  {
    title: '1. About elmi',
    body: 'elmi is a UK-based courier marketplace ("Platform") operated by Elmi Courier Ltd. We connect businesses that need goods delivered ("Businesses") with self-employed drivers ("Drivers"). elmi is not a carrier and does not take physical possession of goods at any point.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years old and legally permitted to work in the United Kingdom to create an account. Drivers must hold a valid UK driving licence, appropriate vehicle insurance, and any other documentation required by law.',
  },
  {
    title: '3. Accounts',
    body: 'You are responsible for keeping your login credentials secure. You must not share your account with anyone else. elmi reserves the right to suspend or terminate accounts that breach these Terms.',
  },
  {
    title: '4. Job postings (Businesses)',
    body: 'Businesses post jobs with a price they are willing to pay. The price is taken as the total amount charged; elmi retains a platform fee (currently 15%) and the remainder is paid to the Driver. Prices must be accurate and in pounds sterling (GBP).',
  },
  {
    title: '5. Accepting jobs (Drivers)',
    body: 'By accepting a job, a Driver enters into a direct contract with the Business for that delivery. Drivers must complete jobs they accept unless there is a genuine safety concern. Repeated cancellations may result in account suspension.',
  },
  {
    title: '6. Payments',
    body: 'Payments are processed by Stripe. By using the Platform you agree to Stripe\'s terms of service. Driver earnings are credited to the Driver\'s connected Stripe account upon delivery. elmi is not responsible for Stripe processing delays.',
  },
  {
    title: '7. Prohibited conduct',
    body: 'You must not: misrepresent yourself or your goods; carry illegal items; engage in discrimination; harass other users; or attempt to circumvent the Platform to avoid fees.',
  },
  {
    title: '8. Liability',
    body: 'elmi is a marketplace and is not liable for loss or damage to goods in transit. Drivers should ensure they hold adequate goods-in-transit ("GIT") insurance. elmi\'s liability is limited to the platform fee paid for the relevant job.',
  },
  {
    title: '9. Changes to these Terms',
    body: 'We may update these Terms from time to time. Continued use of the Platform after changes are published constitutes acceptance. We will notify you of material changes by email.',
  },
  {
    title: '10. Governing law',
    body: 'These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => router.back()} className="text-sm font-bold mb-8 block" style={{ color: 'var(--primary)' }}>
          ← Back
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--primary)' }}>
          elmi<span style={{ color: 'var(--accent)' }}>.</span> Terms of Service
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Last updated: May 2026</p>

        <div className="flex flex-col gap-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold mb-2 text-base">{s.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.body}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-center mt-8" style={{ color: 'var(--text-secondary)' }}>
          Questions? Contact us at <strong>legal@elmicouriers.co.uk</strong>
        </p>
      </div>
      <Footer />
    </div>
  );
}
