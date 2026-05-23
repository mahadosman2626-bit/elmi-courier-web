'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats').then((r) => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total jobs', value: stats.totalJobs, color: 'var(--primary)', href: '/admin/jobs' },
    { label: 'Active jobs', value: stats.activeJobs, color: 'var(--accent)', href: '/admin/jobs' },
    { label: 'Delivered', value: stats.deliveredJobs, color: '#16A34A', href: '/admin/jobs' },
    { label: 'Cancelled', value: stats.cancelledJobs, color: '#DC2626', href: '/admin/jobs' },
    { label: 'Total drivers', value: stats.totalDrivers, color: 'var(--primary)', href: '/admin/drivers' },
    { label: 'Total businesses', value: stats.totalBusinesses, color: 'var(--primary)', href: '/admin/businesses' },
    { label: 'Pending verifications', value: stats.pendingVerifications, color: '#D97706', href: '/admin/drivers' },
    { label: 'Total revenue', value: `£${(stats.totalRevenue || 0).toFixed(2)}`, color: '#16A34A', href: '/admin/jobs' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Admin dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Platform-wide overview</p>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map((s) => (
                <button key={s.label} onClick={() => router.push(s.href)}
                  className="bg-white rounded-2xl p-5 border text-left hover:shadow-sm transition-shadow"
                  style={{ borderColor: 'var(--border)' }}>
                  <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                </button>
              ))}
            </div>

            {stats.pendingVerifications > 0 && (
              <div className="bg-white rounded-2xl p-5 border mb-6 flex items-center justify-between"
                style={{ borderColor: '#D97706', borderWidth: 2 }}>
                <div>
                  <p className="font-bold">⚠️ {stats.pendingVerifications} pending verification{stats.pendingVerifications > 1 ? 's' : ''}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Drivers or businesses waiting for document review</p>
                </div>
                <button onClick={() => router.push('/admin/drivers')}
                  className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                  style={{ background: '#D97706' }}>
                  Review
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Manage jobs', desc: 'View and cancel any job on the platform', href: '/admin/jobs', icon: '📦' },
                { title: 'Manage drivers', desc: 'Verify documents and approve driver accounts', href: '/admin/drivers', icon: '🚐' },
                { title: 'Manage businesses', desc: 'Verify and manage business accounts', href: '/admin/businesses', icon: '🏪' },
              ].map((card) => (
                <button key={card.title} onClick={() => router.push(card.href)}
                  className="bg-white rounded-2xl p-6 border text-left hover:shadow-sm transition-shadow"
                  style={{ borderColor: 'var(--border)' }}>
                  <p className="text-3xl mb-3">{card.icon}</p>
                  <p className="font-bold">{card.title}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
