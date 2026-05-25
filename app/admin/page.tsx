'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

interface Stats {
  totalJobs: number; activeJobs: number; deliveredJobs: number; cancelledJobs: number;
  totalDrivers: number; totalBusinesses: number; pendingVerifications: number; totalRevenue: number;
}

interface Job {
  id: string; status: string; pickupAddress: string; dropoffAddress: string;
  totalPrice: number; createdAt: string;
  business: { name: string; businessProfile: { businessName: string } | null } | null;
  driver: { name: string } | null;
}

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('en-GB', { month: 'short' }) });
  }
  return months;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_COLOR: Record<string, string> = {
  POSTED: '#3B82F6', ACCEPTED: '#8B5CF6', COLLECTING: '#F97316',
  IN_TRANSIT: '#8B5CF6', DELIVERED: '#16A34A', CANCELLED: '#DC2626',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/jobs'),
    ]).then(([s, j]) => {
      setStats(s.data);
      setJobs(j.data);
    }).finally(() => setLoading(false));
  }, []);

  const months = getLast6Months();
  const monthlyRevenue = months.map(({ year, month }) =>
    jobs.filter((j) => {
      const d = new Date(j.createdAt);
      return d.getFullYear() === year && d.getMonth() === month && j.status === 'DELIVERED';
    }).reduce((sum, j) => sum + (j.totalPrice || 0), 0)
  );
  const monthlyJobs = months.map(({ year, month }) =>
    jobs.filter((j) => {
      const d = new Date(j.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length
  );

  const maxRevenue = Math.max(...monthlyRevenue, 1);
  const maxJobs = Math.max(...monthlyJobs, 1);
  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  const completionRate = stats && stats.totalJobs > 0
    ? Math.round((stats.deliveredJobs / stats.totalJobs) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        {/* Dark header */}
        <div className="px-8 py-10" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Admin</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Platform Overview</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {!loading && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Total revenue', value: `£${(stats.totalRevenue || 0).toFixed(2)}`, sub: 'from delivered jobs', color: '#34D399' },
                { label: 'Active jobs', value: stats.activeJobs, sub: 'in progress now', color: '#60A5FA' },
                { label: 'Total drivers', value: stats.totalDrivers, sub: `${stats.pendingVerifications} pending`, color: '#A78BFA' },
                { label: 'Completion rate', value: `${completionRate}%`, sub: `${stats.deliveredJobs} of ${stats.totalJobs} jobs`, color: '#FCD34D' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs font-bold text-white mt-0.5">{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-8">

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          ) : stats ? (
            <>
              {/* Pending verifications alert */}
              {stats.pendingVerifications > 0 && (
                <div className="rounded-2xl p-5 mb-6 flex items-center justify-between"
                  style={{ background: '#FFFBEB', border: '2px solid #D97706' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#92400E' }}>
                        {stats.pendingVerifications} pending verification{stats.pendingVerifications > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#B45309' }}>
                        Drivers or businesses waiting for document review
                      </p>
                    </div>
                  </div>
                  <button onClick={() => router.push('/admin/drivers')}
                    className="px-4 py-2 rounded-xl text-white text-sm font-bold flex-shrink-0"
                    style={{ background: '#D97706' }}>
                    Review now
                  </button>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total jobs', value: stats.totalJobs, color: '#1E3A8A', href: '/admin/jobs' },
                  { label: 'Delivered', value: stats.deliveredJobs, color: '#16A34A', href: '/admin/jobs' },
                  { label: 'Cancelled', value: stats.cancelledJobs, color: '#DC2626', href: '/admin/jobs' },
                  { label: 'Total businesses', value: stats.totalBusinesses, color: '#7C3AED', href: '/admin/businesses' },
                ].map((s) => (
                  <button key={s.label} onClick={() => router.push(s.href)}
                    className="bg-white rounded-2xl p-5 border text-left hover:shadow-sm transition-shadow"
                    style={{ borderColor: 'var(--border)' }}>
                    <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                  </button>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* Revenue chart */}
                <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Revenue</p>
                  <p className="text-sm font-extrabold mb-4" style={{ color: '#0F172A' }}>Monthly (last 6 months)</p>
                  <div className="flex items-end gap-2 h-32">
                    {monthlyRevenue.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: '#1E3A8A', fontSize: 10 }}>
                          {val > 0 ? `£${val < 1000 ? val.toFixed(0) : (val / 1000).toFixed(1) + 'k'}` : ''}
                        </span>
                        <div className="w-full rounded-t-lg" style={{
                          height: `${Math.max((val / maxRevenue) * 96, val > 0 ? 4 : 0)}px`,
                          background: 'linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%)',
                          minHeight: val > 0 ? 4 : 0,
                        }} />
                        <span className="text-xs" style={{ color: '#94A3B8', fontSize: 10 }}>{months[i].label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jobs chart */}
                <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Jobs</p>
                  <p className="text-sm font-extrabold mb-4" style={{ color: '#0F172A' }}>Monthly volume (last 6 months)</p>
                  <div className="flex items-end gap-2 h-32">
                    {monthlyJobs.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: '#F97316', fontSize: 10 }}>
                          {val > 0 ? val : ''}
                        </span>
                        <div className="w-full rounded-t-lg" style={{
                          height: `${Math.max((val / maxJobs) * 96, val > 0 ? 4 : 0)}px`,
                          background: 'linear-gradient(180deg, #EA580C 0%, #FB923C 100%)',
                          minHeight: val > 0 ? 4 : 0,
                        }} />
                        <span className="text-xs" style={{ color: '#94A3B8', fontSize: 10 }}>{months[i].label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent activity + quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Recent jobs feed */}
                <div className="md:col-span-2 bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                  <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <h2 className="text-sm font-bold">Recent activity</h2>
                    <button onClick={() => router.push('/admin/jobs')}
                      className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                      View all →
                    </button>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {recentJobs.length === 0 && (
                      <p className="p-5 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>No jobs yet</p>
                    )}
                    {recentJobs.map((j) => (
                      <button key={j.id} onClick={() => router.push(`/admin/jobs`)}
                        className="w-full px-5 py-3.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[j.status] || '#94A3B8' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: '#0F172A' }}>
                            {j.pickupAddress.split(',')[0]} → {j.dropoffAddress.split(',')[0]}
                          </p>
                          <p className="text-xs truncate" style={{ color: '#94A3B8' }}>
                            {j.business?.businessProfile?.businessName || j.business?.name || '—'}
                            {j.driver ? ` · ${j.driver.name}` : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold" style={{ color: '#16A34A' }}>£{(j.totalPrice || 0).toFixed(2)}</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>{timeAgo(j.createdAt)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-col gap-4">
                  {[
                    { title: 'Manage jobs', desc: 'View and cancel any job', href: '/admin/jobs', icon: '📦', color: '#1E3A8A' },
                    { title: 'Manage drivers', desc: 'Verify documents & approve', href: '/admin/drivers', icon: '🚐', color: '#7C3AED' },
                    { title: 'Manage businesses', desc: 'Verify business accounts', href: '/admin/businesses', icon: '🏪', color: '#0891B2' },
                  ].map((card) => (
                    <button key={card.title} onClick={() => router.push(card.href)}
                      className="bg-white rounded-2xl p-5 border text-left hover:shadow-sm transition-shadow flex items-center gap-4"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ background: `${card.color}18` }}>
                        {card.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm">{card.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
                      </div>
                      <span className="ml-auto text-lg" style={{ color: '#CBD5E1' }}>›</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Failed to load dashboard.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
