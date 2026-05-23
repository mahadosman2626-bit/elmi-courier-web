'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--primary)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl">
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--primary)' }}>
            elmi<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
          <h1 className="text-2xl font-extrabold mt-4 tracking-tight mb-1">Create account</h1>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 mt-4 p-1 rounded-xl" style={{ background: 'var(--background)' }}>
            {(['business', 'driver'] as const).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ background: role === r ? 'var(--primary)' : 'transparent', color: role === r ? 'white' : 'var(--text-secondary)' }}>
                {r === 'business' ? '🏪 Business' : '🚐 Driver'}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: role === 'business' ? 'Business name' : 'Full name', value: name, onChange: setName, placeholder: role === 'business' ? 'Smith Supplies Ltd' : 'John Smith', type: 'text' },
              { label: 'Email address', value: email, onChange: setEmail, placeholder: 'you@example.com', type: 'email' },
              { label: 'Phone number', value: phone, onChange: setPhone, placeholder: '+44 7700 000000', type: 'tel' },
              { label: 'Password', value: password, onChange: setPassword, placeholder: 'Min. 8 characters', type: 'password' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{field.label}</label>
                <input type={field.type} value={field.value} onChange={(e) => field.onChange(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  placeholder={field.placeholder} />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 disabled:opacity-60"
              style={{ background: 'var(--primary)' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            By signing up you agree to our{' '}
            <a href="/terms" className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>Terms</a> and{' '}
            <a href="/privacy" className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
          </p>
          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
