'use client';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

const sections = [
  {
    title: '1. Who we are',
    body: 'Elmi Courier Ltd ("elmi", "we", "us") is the data controller for personal data processed through the elmi Platform. We are registered in England and Wales.',
  },
  {
    title: '2. What data we collect',
    body: 'We collect: your name, email address, phone number, and password when you register; job details (addresses, load description, photos) when you post or accept a job; payment data processed by Stripe (we do not store raw card details); driver documents (driving licence, insurance, GIT certificate) for verification; approximate device location when you are actively on a job; device push notification tokens; and messages sent via the in-app chat.',
  },
  {
    title: '3. How we use your data',
    body: 'We use your data to: operate the Platform and match jobs with drivers; process payments via Stripe; verify driver documents; send push notifications about your jobs; comply with legal obligations; and improve the Platform.',
  },
  {
    title: '4. Legal basis (UK GDPR)',
    body: 'We process your data on the following bases: performance of a contract (operating your account and processing jobs); legitimate interests (fraud prevention, platform security); compliance with legal obligations; and, where required, consent (e.g. marketing communications).',
  },
  {
    title: '5. Sharing your data',
    body: 'We share data with: Stripe for payment processing; Expo/Firebase for push notifications; Railway for cloud hosting; and, where required by law, regulatory bodies. We do not sell your personal data to third parties.',
  },
  {
    title: '6. Data retention',
    body: 'We retain your account data for as long as your account is active. Job records are kept for 7 years for legal and financial compliance. Driver verification documents are deleted 30 days after account closure.',
  },
  {
    title: '7. Your rights',
    body: 'Under UK GDPR you have the right to: access your personal data; correct inaccurate data; request erasure ("right to be forgotten"); restrict processing; data portability; and object to processing. To exercise these rights, contact us at privacy@elmicourier.co.uk.',
  },
  {
    title: '8. Security',
    body: 'We use industry-standard security measures including TLS encryption in transit and bcrypt password hashing. However, no transmission over the internet is 100% secure.',
  },
  {
    title: '9. Cookies',
    body: 'Our web platform uses localStorage for session management. We do not use advertising or tracking cookies.',
  },
  {
    title: '10. Changes to this policy',
    body: 'We may update this Privacy Policy. We will notify you of significant changes by email. Continued use of the Platform after notification constitutes acceptance.',
  },
];

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => router.back()} className="text-sm font-bold mb-8 block" style={{ color: 'var(--primary)' }}>
          ← Back
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--primary)' }}>
          elmi<span style={{ color: 'var(--accent)' }}>.</span> Privacy Policy
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
          Questions? Contact us at <strong>privacy@elmicourier.co.uk</strong>
        </p>
      </div>
      <Footer />
    </div>
  );
}
