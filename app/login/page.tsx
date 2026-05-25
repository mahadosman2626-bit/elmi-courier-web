'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await login(email.toLowerCase().trim(), password);
      const saved = localStorage.getItem('elmi_user');
      const role = saved ? JSON.parse(saved).role : 'BUSINESS';
      router.replace(role === 'DRIVER' ? '/driver' : role === 'ADMIN' ? '/admin' : '/business');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Login failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0F172A' }}>
        <button onClick={() => router.push('/')} className="text-2xl font-extrabold tracking-tight text-white w-fit">
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>

        <div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Same-day van delivery.<br />
            <span style={{ color: '#F97316' }}>Built for UK businesses.</span>
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Post a job in under 2 minutes. Every driver is verified before they go live.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '✅', text: 'Driving licence, insurance & GIT cover verified' },
              { icon: '📍', text: 'Live tracking on every delivery' },
              { icon: '💷', text: 'Secure payments via Stripe' },
            ].map((p) => (
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
        <button onClick={() => router.push('/')} className="text-2xl font-extrabold tracking-tight mb-10 lg:hidden" style={{ color: '#1E3A8A' }}>
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0F172A' }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>Sign in to your elmi account</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                placeholder="Enter your password" />
            </div>

            <button type="submit" disabled={loading || !email || !password}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-1 disabled:opacity-50 transition-opacity"
              style={{ background: '#1E3A8A' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
          </div>

          <p className="text-center text-sm" style={{ color: '#64748B' }}>
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/register')} className="font-bold hover:underline" style={{ color: '#1E3A8A' }}>
              Create one free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
