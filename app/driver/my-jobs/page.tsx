'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

export default function DriverMyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/api/jobs/my').then((r) => { setJobs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statuses = ['ALL', 'ACCEPTED', 'COLLECTING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">My jobs</h1>

        <div className="flex gap-2 flex-wrap mb-6">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{
                background: filter === s ? 'var(--primary)' : 'var(--background)',
                color: filter === s ? 'white' : 'var(--text-secondary)',
                border: '1.5px solid',
                borderColor: filter === s ? 'var(--primary)' : 'var(--border)',
              }}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: 'var(--border)' }}>
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No jobs found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((job) => (
              <button key={job.id} onClick={() => router.push(`/driver/my-jobs/${job.id}`)}
                className="bg-white rounded-2xl p-5 border text-left hover:shadow-sm transition-shadow w-full"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}</span>
                  <StatusBadge status={job.status} />
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold" style={{ color: '#16A34A' }}>£{job.driverEarnings?.toFixed(2)}</span>
                  <span>{job.vanSize}</span>
                  <span>{new Date(job.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
