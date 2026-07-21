'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://elmi-courier-backend-production.up.railway.app';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, { token, password });
      setDone(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Something went wrong. Your link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-5">⚠️</div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: '#0F172A' }}>Invalid link</h1>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>This password reset link is missing or invalid.</p>
        <button onClick={() => router.push('/forgot-password')}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
          style={{ background: '#1E3A8A' }}>
          Request a new link
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-5">✅</div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: '#0F172A' }}>Password updated</h1>
        <p className="text-sm mb-8" style={{ color: '#64748B' }}>Your password has been changed. You can now sign in with your new password.</p>
        <button onClick={() => router.push('/login')}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
          style={{ background: '#1E3A8A' }}>
          Sign in →
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0F172A' }}>Set a new password</h1>
      <p className="text-sm mb-8" style={{ color: '#64748B' }}>Choose a strong password for your Elmi account.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>New password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: '#E2E8F0' }}
            placeholder="Min. 8 characters" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Confirm password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: '#E2E8F0' }}
            placeholder="Repeat your password" />
        </div>
        <button type="submit" disabled={loading || !password || !confirm}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-1 disabled:opacity-50 transition-opacity"
          style={{ background: '#1E3A8A' }}>
          {loading ? 'Saving…' : 'Save new password →'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0F172A' }}>
        <button onClick={() => router.push('/')} className="text-2xl font-extrabold tracking-tight text-white w-fit">
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>
        <div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Create a<br /><span style={{ color: '#F97316' }}>new password.</span>
          </h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Pick something strong and memorable. You&apos;ll use it every time you sign in to Elmi.
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
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
