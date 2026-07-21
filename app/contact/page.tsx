'use client';
import { useState } from 'react';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    const mailto = `mailto:support@elmicouriers.co.uk?subject=${encodeURIComponent(subject || 'Enquiry from ' + name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2';
  const inputStyle = { borderColor: 'var(--border)', background: 'var(--background)' };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <PublicNav />

      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: 'var(--primary)' }}>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">Contact us</h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
          We're here to help. Send us a message and we'll get back to you within 24 hours on business days.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-8 flex-1 w-full">

        {/* Contact details */}
        <div className="flex flex-col gap-4 md:w-64 flex-shrink-0">
          {[
            { icon: '📧', label: 'General enquiries', value: 'hello@elmicouriers.co.uk', href: 'mailto:hello@elmicouriers.co.uk' },
            { icon: '🚐', label: 'Driver support', value: 'drivers@elmicouriers.co.uk', href: 'mailto:drivers@elmicouriers.co.uk' },
            { icon: '🏪', label: 'Business support', value: 'support@elmicouriers.co.uk', href: 'mailto:support@elmicouriers.co.uk' },
            { icon: '⚖️', label: 'Legal', value: 'legal@elmicouriers.co.uk', href: 'mailto:legal@elmicouriers.co.uk' },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-2xl mb-2">{c.icon}</p>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
              <a href={c.href} className="text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>{c.value}</a>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="flex-1 bg-white rounded-2xl p-8 border self-start" style={{ borderColor: 'var(--border)' }}>
          {sent ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">✅</p>
              <h2 className="text-xl font-extrabold mb-2">Message ready to send</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Your email client should have opened. If it didn't,{' '}
                <a href="mailto:support@elmicouriers.co.uk" className="underline font-semibold" style={{ color: 'var(--primary)' }}>
                  email us directly
                </a>.
              </p>
              <button onClick={() => setSent(false)}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm"
                style={{ background: 'var(--primary)' }}>
                Send another
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-extrabold mb-6">Send us a message</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Your name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className={inputClass} style={inputStyle} placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className={inputClass} style={inputStyle} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className={inputClass} style={inputStyle}>
                    <option value="">Select a topic…</option>
                    <option>I have a question about posting a job</option>
                    <option>I have a question about driver earnings</option>
                    <option>I need help with my account</option>
                    <option>I want to report a problem</option>
                    <option>I have a billing question</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                    rows={5} className={inputClass} style={inputStyle}
                    placeholder="Tell us how we can help…" />
                </div>
                <button onClick={handleSubmit} disabled={!name || !email || !message}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-40"
                  style={{ background: 'var(--accent)' }}>
                  Send message →
                </button>
                <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                  This will open your email client. We aim to respond within 24 hours.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
