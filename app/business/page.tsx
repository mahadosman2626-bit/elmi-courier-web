'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/jobs/my').then((r) => { setJobs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const active = jobs.filter((j) => !['DELIVERED', 'CANCELLED'].includes(j.status));
  const recent = jobs.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Good to see you, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your deliveries today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active jobs', value: active.length, color: 'var(--accent)' },
            { label: 'Total jobs', value: jobs.length, color: 'var(--primary)' },
            { label: 'Delivered', value: jobs.filter((j) => j.status === 'DELIVERED').length, color: '#16A34A' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Post job CTA */}
        <button onClick={() => router.push('/business/post-job')}
          className="w-full py-4 rounded-2xl text-white font-bold text-base mb-8 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)' }}>
          <span className="text-xl">+</span> Post a new job
        </button>

        {/* Recent jobs */}
        <div>
          <h2 className="text-lg font-bold mb-4">Recent jobs</h2>
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          ) : recent.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold">No jobs yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Post your first job to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((job) => (
                <button key={job.id} onClick={() => router.push(`/business/jobs/${job.id}`)}
                  className="bg-white rounded-2xl p-5 border text-left hover:shadow-sm transition-shadow w-full"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>£{job.totalPrice?.toFixed(2)}</span>
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
