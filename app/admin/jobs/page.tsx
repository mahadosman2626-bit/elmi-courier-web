'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

interface Job {
  id: string; status: string; pickupAddress: string; dropoffAddress: string;
  totalPrice: number; driverEarnings: number; vanSize: string; urgency: string;
  createdAt: string; deliveredAt: string | null;
  business: { id: string; name: string; businessProfile: { businessName: string } | null } | null;
  driver: { id: string; name: string } | null;
}

const STATUS_ORDER = ['ALL', 'POSTED', 'ACCEPTED', 'COLLECTING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
const STATUS_COLOR: Record<string, string> = {
  POSTED: '#3B82F6', ACCEPTED: '#8B5CF6', COLLECTING: '#F97316',
  IN_TRANSIT: '#7C3AED', DELIVERED: '#16A34A', CANCELLED: '#DC2626',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchJobs = () =>
    api.get('/api/admin/jobs')
      .then((r) => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchJobs(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: jobs.length };
    STATUS_ORDER.slice(1).forEach((s) => { c[s] = jobs.filter((j) => j.status === s).length; });
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    let list = filter === 'ALL' ? jobs : jobs.filter((j) => j.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((j) =>
        j.pickupAddress?.toLowerCase().includes(q) ||
        j.dropoffAddress?.toLowerCase().includes(q) ||
        j.business?.businessProfile?.businessName?.toLowerCase().includes(q) ||
        j.business?.name?.toLowerCase().includes(q) ||
        j.driver?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, filter, search]);

  const totalRevenue = jobs.filter((j) => j.status === 'DELIVERED').reduce((s, j) => s + (j.totalPrice || 0), 0);

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
      <div className="max-w-6xl mx-auto">

        {/* Dark header */}
        <div className="px-8 py-8" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}>
          <button onClick={() => router.back()} className="text-xs font-bold mb-4 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            ← Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-4">All Jobs</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total jobs', value: jobs.length, color: '#60A5FA' },
              { label: 'Active now', value: (counts.POSTED || 0) + (counts.ACCEPTED || 0) + (counts.COLLECTING || 0) + (counts.IN_TRANSIT || 0), color: '#A78BFA' },
              { label: 'Delivered', value: counts.DELIVERED || 0, color: '#34D399' },
              { label: 'Platform revenue', value: `£${totalRevenue.toFixed(2)}`, color: '#FCD34D' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6">

          {/* Search + filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#94A3B8' }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by route, business, or driver…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', background: 'white' }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_ORDER.map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{
                    background: filter === s ? (STATUS_COLOR[s] || '#1E3A8A') : 'white',
                    color: filter === s ? 'white' : 'var(--text-secondary)',
                    border: '1.5px solid',
                    borderColor: filter === s ? (STATUS_COLOR[s] || '#1E3A8A') : 'var(--border)',
                  }}>
                  {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                  {counts[s] !== undefined && (
                    <span className="ml-1.5 opacity-70">{counts[s]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm py-12 text-center" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-3xl mb-3">📦</p>
              <p className="font-semibold text-sm">No jobs found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {search ? 'Try a different search term' : 'No jobs match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
                      <th className="px-5 py-3 text-left text-xs font-bold" style={{ color: '#64748B' }}>Route</th>
                      <th className="px-5 py-3 text-left text-xs font-bold" style={{ color: '#64748B' }}>Status</th>
                      <th className="px-5 py-3 text-left text-xs font-bold" style={{ color: '#64748B' }}>Business</th>
                      <th className="px-5 py-3 text-left text-xs font-bold" style={{ color: '#64748B' }}>Driver</th>
                      <th className="px-5 py-3 text-left text-xs font-bold" style={{ color: '#64748B' }}>Van</th>
                      <th className="px-5 py-3 text-left text-xs font-bold" style={{ color: '#64748B' }}>Price</th>
                      <th className="px-5 py-3 text-left text-xs font-bold" style={{ color: '#64748B' }}>Posted</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((job, i) => (
                      <tr key={job.id}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                        <td className="px-5 py-3.5" onClick={() => router.push(`/admin/jobs`)}>
                          <p className="font-semibold text-xs leading-snug">
                            {job.pickupAddress?.split(',')[0]}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                            → {job.dropoffAddress?.split(',')[0]}
                          </p>
                        </td>
                        <td className="px-5 py-3.5" onClick={() => router.push(`/admin/jobs`)}>
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: '#475569' }} onClick={() => router.push(`/admin/jobs`)}>
                          {job.business?.businessProfile?.businessName || job.business?.name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs" onClick={() => router.push(`/admin/jobs`)}>
                          {job.driver ? (
                            <span className="font-medium" style={{ color: '#475569' }}>{job.driver.name}</span>
                          ) : (
                            <span style={{ color: '#CBD5E1' }}>Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }} onClick={() => router.push(`/admin/jobs`)}>
                          {job.vanSize || '—'}
                        </td>
                        <td className="px-5 py-3.5" onClick={() => router.push(`/admin/jobs`)}>
                          <span className="text-sm font-bold" style={{ color: '#16A34A' }}>
                            £{(job.totalPrice || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }} onClick={() => router.push(`/admin/jobs`)}>
                          {timeAgo(job.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          {!['DELIVERED', 'CANCELLED'].includes(job.status) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); cancelJob(job.id); }}
                              disabled={cancelling === job.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold border opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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

              {/* Mobile cards */}
              <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map((job) => (
                  <div key={job.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                          {job.business?.businessProfile?.businessName || job.business?.name || '—'}
                          {job.driver ? ` · ${job.driver.name}` : ''}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                        <span>{job.vanSize || '—'}</span>
                        <span>{timeAgo(job.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: '#16A34A' }}>£{(job.totalPrice || 0).toFixed(2)}</span>
                        {!['DELIVERED', 'CANCELLED'].includes(job.status) && (
                          <button
                            onClick={() => cancelJob(job.id)}
                            disabled={cancelling === job.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-50"
                            style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                            {cancelling === job.id ? '…' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer count */}
              <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border)', background: '#F8FAFC' }}>
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  Showing {filtered.length} of {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
