import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--primary)' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              elmi<span style={{ color: 'var(--accent)' }}>.</span>
            </span>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Trusted delivery · UK</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'About us', href: '/about' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Contact us', href: '/contact' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="text-sm font-medium hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.65)' }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs border-t"
          style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)' }}>
          <p>© {new Date().getFullYear()} Elmi Courier Ltd · Registered in England & Wales</p>
          <a href="mailto:support@elmicouriers.co.uk" style={{ color: 'rgba(255,255,255,0.4)' }}>support@elmicouriers.co.uk</a>
        </div>
      </div>
    </footer>
  );
}
