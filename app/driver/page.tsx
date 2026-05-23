'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

export default function DriverDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/jobs/my').then((r) => setJobs(r.data)),
      api.get('/api/driver/earnings').then((r) => setEarnings(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) => ['ACCEPTED', 'COLLECTING', 'IN_TRANSIT'].includes(j.status));
  const recentJobs = jobs.slice(0, 5);

  const toggleOnline = async () => {
    setTogglingStatus(true);
    try {
      const { data } = await api.patch('/api/driver/status', { isOnline: !isOnline });
      setIsOnline(data.isOnline);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e?.response?.data?.error || 'Could not update status.');
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Here's your day at a glance.</p>
          </div>
          <button onClick={toggleOnline} disabled={togglingStatus}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{
              background: isOnline ? '#F0FDF4' : 'var(--background)',
              color: isOnline ? '#16A34A' : 'var(--text-secondary)',
              border: '2px solid',
              borderColor: isOnline ? '#16A34A' : 'var(--border)',
            }}>
            {togglingStatus ? '…' : isOnline ? '● Online' : '○ Go online'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active jobs', value: activeJobs.length, color: 'var(--accent)' },
            { label: 'Total jobs', value: jobs.filter((j) => j.status === 'DELIVERED').length, color: 'var(--primary)' },
            { label: 'Available balance', value: `£${(earnings?.availableBalance || 0).toFixed(2)}`, color: '#16A34A' },
            { label: 'Total earned', value: `£${(earnings?.totalEarnings || 0).toFixed(2)}`, color: 'var(--text-primary)' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={() => router.push('/driver/jobs')}
          className="w-full py-4 rounded-2xl text-white font-bold text-base mb-8 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)' }}>
          🔍 Browse available jobs
        </button>

        {/* Active jobs */}
        {activeJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Active jobs</h2>
            <div className="flex flex-col gap-3">
              {activeJobs.map((job) => (
                <button key={job.id} onClick={() => router.push(`/driver/my-jobs/${job.id}`)}
                  className="bg-white rounded-2xl p-5 border text-left hover:shadow-sm transition-shadow w-full"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-bold" style={{ color: '#16A34A' }}>£{job.driverEarnings?.toFixed(2)} yours</span>
                    <span>{job.vanSize}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent jobs */}
        <div>
          <h2 className="text-lg font-bold mb-4">Recent jobs</h2>
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          ) : recentJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-4xl mb-3">🚐</p>
              <p className="font-semibold">No jobs yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Go online and browse available jobs.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentJobs.map((job) => (
                <button key={job.id} onClick={() => router.push(`/driver/my-jobs/${job.id}`)}
                  className="bg-white rounded-2xl p-5 border text-left hover:shadow-sm transition-shadow w-full"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>£{job.driverEarnings?.toFixed(2)}</span>
                    <span>{job.vanSize}</span>
                    <span>{new Date(job.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
