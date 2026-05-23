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
    <div className="min-h-screen flex" style={{ background: 'var(--primary)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl">
          <div className="mb-8">
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--primary)' }}>
              elmi<span style={{ color: 'var(--accent)' }}>.</span>
            </span>
            <h1 className="text-2xl font-extrabold mt-4 tracking-tight">Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                placeholder="Enter your password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 disabled:opacity-60 transition-opacity"
              style={{ background: 'var(--primary)' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/register')} className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
