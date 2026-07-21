'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

const BUSINESS_PERKS = [
  { icon: '📋', text: 'Post a job in under 2 minutes' },
  { icon: '🚐', text: 'Vetted drivers respond in real time' },
  { icon: '📍', text: 'Live tracking on every delivery' },
  { icon: '💷', text: 'Secure payment via Stripe' },
];

const DRIVER_PERKS = [
  { icon: '💷', text: 'Keep 88% of every job — instant payout' },
  { icon: '⏰', text: 'Choose your own hours — no shifts' },
  { icon: '📱', text: 'Manage everything from the app or web' },
  { icon: '✅', text: 'Quick verification — start earning fast' },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [role, setRole] = useState<'business' | 'driver'>(
    (searchParams.get('role') as 'business' | 'driver') || 'business'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      await register({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password,
        role: role === 'driver' ? 'DRIVER' : 'BUSINESS',
        businessName: role === 'business' ? name.trim() : '',
      });
      router.replace(role === 'driver' ? '/driver' : '/business');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const perks = role === 'business' ? BUSINESS_PERKS : DRIVER_PERKS;
  const panelHeading = role === 'business'
    ? <>Book vetted drivers.<br /><span style={{ color: '#F97316' }}>In minutes.</span></>
    : <>Drive on your terms.<br /><span style={{ color: '#F97316' }}>Keep 85%.</span></>;

  return (
    <div className="min-h-screen flex">

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0F172A' }}>
        <button onClick={() => router.push('/')} className="text-2xl font-extrabold tracking-tight text-white w-fit">
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>

        <div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5 tracking-widest"
            style={{ background: 'rgba(249,115,22,0.18)', color: '#F97316' }}>
            {role === 'business' ? 'FOR BUSINESSES' : 'FOR DRIVERS'}
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            {panelHeading}
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {role === 'business'
              ? 'Connect with insured van drivers across the UK. No phone calls, no spreadsheets.'
              : 'Accept jobs near you, get paid instantly, and work whenever you want.'}
          </p>
          <div className="flex flex-col gap-4">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2026 Elmi Courier Ltd · Registered in England & Wales</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16" style={{ background: '#F8FAFC' }}>

        {/* Mobile logo */}
        <button onClick={() => router.push('/')} className="text-2xl font-extrabold tracking-tight mb-8 lg:hidden" style={{ color: '#1E3A8A' }}>
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0F172A' }}>Create your account</h1>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>Free to join. No subscription required.</p>

          {/* Role toggle */}
          <div className="flex gap-1.5 p-1 rounded-xl mb-6" style={{ background: '#E2E8F0' }}>
            {([
              { value: 'business', label: '🏪 Business' },
              { value: 'driver',   label: '🚐 Driver' },
            ] as const).map((r) => (
              <button key={r.value} onClick={() => setRole(r.value)}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: role === r.value ? 'white' : 'transparent',
                  color: role === r.value ? '#0F172A' : '#64748B',
                  boxShadow: role === r.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}>
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                {role === 'business' ? 'Business name' : 'Full name'}
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                placeholder={role === 'business' ? 'Smith Supplies Ltd' : 'John Smith'} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                placeholder="+44 7700 000000" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                placeholder="Min. 8 characters" />
            </div>

            <button type="submit" disabled={loading || !name || !email || !phone || !password}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-1 disabled:opacity-50 transition-opacity"
              style={{ background: '#1E3A8A' }}>
              {loading ? 'Creating account…' : `Create ${role} account →`}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: '#94A3B8' }}>
            By signing up you agree to our{' '}
            <a href="/terms" className="font-semibold hover:underline" style={{ color: '#1E3A8A' }}>Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="font-semibold hover:underline" style={{ color: '#1E3A8A' }}>Privacy Policy</a>
          </p>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
          </div>

          <p className="text-center text-sm" style={{ color: '#64748B' }}>
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="font-bold hover:underline" style={{ color: '#1E3A8A' }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
