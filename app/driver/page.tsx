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

const ACTIVE_LABELS: Record<string, string> = {
  ACCEPTED: 'Job accepted',
  COLLECTING: 'Collecting items',
  IN_TRANSIT: 'En route to drop-off',
};

export default function DriverDashboard() {
  const { } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/jobs/my').then((r) => setJobs(Array.isArray(r.data) ? r.data : [])),
      api.get('/api/driver/earnings').then((r) => setEarnings(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const activeJob = jobs.find((j) => ['ACCEPTED', 'COLLECTING', 'IN_TRANSIT'].includes(j.status));
  const recentJobs = jobs.slice(0, 5);
  const deliveredCount = jobs.filter((j) => j.status === 'DELIVERED').length;

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
      <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Dark header */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between" style={{ background: '#0F172A' }}>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{getGreeting()}</p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isOnline ? `${jobs.length > 0 ? deliveredCount : 0} jobs available` : 'You\'re offline'}
            </h1>
          </div>
          <button onClick={toggleOnline} disabled={togglingStatus}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all flex-shrink-0"
            style={{
              background: isOnline ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.08)',
              color: isOnline ? '#4ADE80' : 'rgba(255,255,255,0.7)',
              border: `1.5px solid ${isOnline ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.12)'}`,
            }}>
            <span className="w-2 h-2 rounded-full" style={{ background: isOnline ? '#4ADE80' : 'rgba(255,255,255,0.4)' }} />
            {togglingStatus ? '…' : isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white"
            style={{ background: '#475569' }}>
            <span>⚡</span> Go online to see and accept jobs
          </div>
        )}

        {/* Active job banner */}
        {activeJob && (
          <button onClick={() => router.push(`/driver/my-jobs/${activeJob.id}`)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
            style={{ background: '#F97316' }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-white flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white uppercase tracking-wide opacity-80">Active Job</p>
                <p className="text-sm font-bold text-white">{ACTIVE_LABELS[activeJob.status]}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {activeJob.pickupAddress?.split(',')[0]} → {activeJob.dropoffAddress?.split(',')[0]}
                </p>
              </div>
            </div>
            <span className="text-white text-lg flex-shrink-0">›</span>
          </button>
        )}

        <div className="px-6 py-6 max-w-3xl mx-auto flex flex-col gap-5">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Jobs Delivered', value: deliveredCount, color: '#1E3A8A' },
              { label: 'Active Now', value: activeJob ? 1 : 0, color: '#F97316' },
              { label: 'Available Balance', value: `£${(earnings?.availableBalance || 0).toFixed(2)}`, color: '#16A34A' },
              { label: 'Total Earned', value: `£${(earnings?.totalEarnings || 0).toFixed(2)}`, color: '#0F172A' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Browse jobs CTA */}
          <button onClick={() => router.push('/driver/jobs')}
            className="w-full py-4 rounded-2xl text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ background: isOnline ? '#1E3A8A' : '#94A3B8' }}>
            🔍 Browse available jobs
          </button>

          {/* Recent jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Recent Jobs</p>
              <button onClick={() => router.push('/driver/my-jobs')}
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
                <p className="text-4xl mb-3">🚐</p>
                <p className="font-semibold" style={{ color: '#0F172A' }}>No jobs yet</p>
                <p className="text-sm mt-1" style={{ color: '#64748B' }}>Go online and browse available jobs.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentJobs.map((job) => (
                  <button key={job.id} onClick={() => router.push(`/driver/my-jobs/${job.id}`)}
                    className="bg-white rounded-2xl p-4 border text-left hover:shadow-sm transition-shadow w-full"
                    style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold flex-1 mr-2" style={{ color: '#0F172A' }}>
                        {job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#64748B' }}>
                      <span className="font-bold" style={{ color: '#16A34A' }}>£{job.driverEarnings?.toFixed(2)} yours</span>
                      <span>{job.vanSize}</span>
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
