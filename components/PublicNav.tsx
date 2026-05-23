'use client';
import { useRouter } from 'next/navigation';

export default function PublicNav() {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between px-8 py-4" style={{ background: 'var(--primary)' }}>
      <button onClick={() => router.push('/')}
        className="text-xl font-extrabold tracking-tight text-white">
        elmi<span style={{ color: 'var(--accent)' }}>.</span>
      </button>
      <div className="flex gap-3">
        <button onClick={() => router.push('/login')}
          className="px-5 py-2 rounded-xl text-sm font-semibold border"
          style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)' }}>
          Sign in
        </button>
        <button onClick={() => router.push('/register')}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--accent)' }}>
          Get started
        </button>
      </div>
    </nav>
  );
}
