'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://elmi-courier-backend-production.up.railway.app';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email: email.toLowerCase().trim() });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0F172A' }}>
        <button onClick={() => router.push('/')} className="text-2xl font-extrabold tracking-tight text-white w-fit">
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>
        <div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Forgot your<br /><span style={{ color: '#F97316' }}>password?</span>
          </h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
            No problem. Enter your email address and we&apos;ll send you a link to set a new one.
          </p>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2026 Elmi Courier Ltd · Registered in England & Wales</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16" style={{ background: '#F8FAFC' }}>

        <button onClick={() => router.push('/')} className="text-2xl font-extrabold tracking-tight mb-10 lg:hidden" style={{ color: '#1E3A8A' }}>
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>

        <div className="w-full max-w-sm">

          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-5">📬</div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: '#0F172A' }}>Check your inbox</h1>
              <p className="text-sm mb-8" style={{ color: '#64748B' }}>
                We&apos;ve sent a password reset link to <strong style={{ color: '#0F172A' }}>{email}</strong>.
                The link expires in 1 hour.
              </p>
              <p className="text-xs mb-6" style={{ color: '#94A3B8' }}>
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="font-semibold hover:underline" style={{ color: '#1E3A8A' }}>
                  try again
                </button>.
              </p>
              <button onClick={() => router.push('/login')}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
                style={{ background: '#1E3A8A' }}>
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0F172A' }}>Reset your password</h1>
              <p className="text-sm mb-8" style={{ color: '#64748B' }}>Enter your account email and we&apos;ll send a reset link.</p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E2E8F0' }}
                    placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading || !email}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-1 disabled:opacity-50 transition-opacity"
                  style={{ background: '#1E3A8A' }}>
                  {loading ? 'Sending…' : 'Send reset link →'}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: '#64748B' }}>
                Remembered it?{' '}
                <button onClick={() => router.push('/login')} className="font-bold hover:underline" style={{ color: '#1E3A8A' }}>
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
