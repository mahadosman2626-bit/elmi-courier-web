'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function PublicNav() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background: 'var(--primary)' }}>
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-6xl mx-auto">
        <button onClick={() => router.push('/')}
          className="text-xl font-extrabold tracking-tight text-white flex-shrink-0">
          elmi<span style={{ color: 'var(--accent)' }}>.</span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
            { label: 'For drivers', href: '/drivers' },
            { label: 'FAQ', href: '/faq' },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium hover:text-white transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/login')}
            className="hidden md:block px-5 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)' }}>
            Sign in
          </button>
          <button onClick={() => router.push('/register')}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--accent)' }}>
            Get started
          </button>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span style={{ fontSize: 20 }}>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {[
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
            { label: 'For drivers', href: '/drivers' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Sign in', href: '/login' },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium py-2 border-b"
              style={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
