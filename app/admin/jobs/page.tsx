'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchJobs = () => api.get('/api/admin/jobs').then((r) => { setJobs(r.data); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { fetchJobs(); }, []);

  const statuses = ['ALL', 'POSTED', 'ACCEPTED', 'COLLECTING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? jobs : jobs.filter((j) => j.status === filter);

  const cancelJob = async (jobId: string) => {
    if (!confirm('Cancel this job? This cannot be undone.')) return;
    setCancelling(jobId);
    try {
      await api.post(`/api/admin/jobs/${jobId}/cancel`);
      fetchJobs();
    } finally {
      setCancelling(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">All jobs</h1>

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
              {s === 'ALL' ? `All (${jobs.length})` : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: 'var(--border)' }}>
            <p className="font-semibold">No jobs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Route</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Business</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Price</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => (
                  <tr key={job.id}
                    onClick={() => router.push(`/admin/jobs/${job.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-4 py-3 font-medium">
                      {job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {job.business?.businessProfile?.businessName || job.business?.name || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {job.driver?.name || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold">£{job.totalPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(job.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      {!['DELIVERED', 'CANCELLED'].includes(job.status) && (
                        <button onClick={(e) => { e.stopPropagation(); cancelJob(job.id); }} disabled={cancelling === job.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-50"
                          style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                          {cancelling === job.id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
