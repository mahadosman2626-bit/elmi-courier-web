'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function BusinessDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const profile = (user as any)?.businessProfile;

  useEffect(() => {
    api.get('/api/jobs/my')
      .then((r) => setJobs(Array.isArray(r.data) ? r.data : r.data.jobs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const activeJob = jobs.find((j) => ['ACCEPTED', 'COLLECTING', 'IN_TRANSIT'].includes(j.status));
  const recentJobs = jobs.slice(0, 5);
  const delivered = jobs.filter((j) => j.status === 'DELIVERED').length;

  const STATUS_LABEL: Record<string, string> = {
    ACCEPTED: 'Driver assigned',
    COLLECTING: 'Driver collecting',
    IN_TRANSIT: 'In transit',
  };

  return (
    <DashboardLayout>
      <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Dark header */}
        <div className="px-8 pt-8 pb-6" style={{ background: '#0F172A' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{getGreeting()} 👋</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {profile?.businessName || user?.name || 'Welcome back'}
          </h1>
        </div>

        <div className="px-6 py-6 max-w-3xl mx-auto flex flex-col gap-5">

          {/* Post job banner */}
          <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#1E3A8A' }}>
            <div>
              <p className="font-bold text-white text-base mb-0.5">Need a delivery?</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Book a verified driver in minutes</p>
            </div>
            <button onClick={() => router.push('/business/post-job')}
              className="px-5 py-3 rounded-xl text-white font-bold text-sm flex-shrink-0"
              style={{ background: '#F97316' }}>
              + Post job
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl flex divide-x shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            {[
              { label: 'Total Jobs', value: profile?.totalJobs ?? jobs.length },
              { label: 'Total Spend', value: `£${(profile?.totalSpend ?? 0).toFixed(0)}` },
              { label: 'Rating', value: profile?.averageRating ? `${profile.averageRating.toFixed(1)} ⭐` : `${delivered} ✓` },
            ].map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-5">
                <p className="text-xl font-extrabold" style={{ color: '#0F172A' }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Active job alert */}
          {activeJob && (
            <button onClick={() => router.push(`/business/jobs/${activeJob.id}`)}
              className="w-full rounded-2xl p-4 flex items-center justify-between text-left border"
              style={{ background: '#FFFBEB', borderColor: '#FCD34D' }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#F59E0B' }} />
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#92400E' }}>
                    {STATUS_LABEL[activeJob.status] || activeJob.status}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#B45309' }}>
                    {activeJob.driver?.name ?? 'Awaiting driver'} · {activeJob.pickupAddress?.split(',')[0]} → {activeJob.dropoffAddress?.split(',')[0]}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold flex-shrink-0 ml-3" style={{ color: '#92400E' }}>View →</span>
            </button>
          )}

          {/* Recent jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Recent Jobs</p>
              <button onClick={() => router.push('/business/jobs')}
                className="text-xs font-semibold hover:underline" style={{ color: '#1E3A8A' }}>
                See all →
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 text-center">
                <p className="text-sm" style={{ color: '#94A3B8' }}>Loading…</p>
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-4xl mb-3">📦</p>
                <p className="font-semibold" style={{ color: '#0F172A' }}>No jobs yet</p>
                <p className="text-sm mt-1" style={{ color: '#64748B' }}>Post your first job above to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentJobs.map((job) => (
                  <button key={job.id} onClick={() => router.push(`/business/jobs/${job.id}`)}
                    className="bg-white rounded-2xl p-4 border text-left hover:shadow-sm transition-shadow w-full"
                    style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold flex-1 mr-2" style={{ color: '#0F172A' }}>
                        {job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#64748B' }}>
                      <span className="font-bold" style={{ color: '#0F172A' }}>£{job.totalPrice?.toFixed(2)}</span>
                      <span>{job.vanSize}</span>
                      <span>🚐 {job.driver?.name ?? 'Awaiting driver'}</span>
                      <span>{new Date(job.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4" />
        </div>
      </div>
    </DashboardLayout>
  );
}
