'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

const VAN_FILTERS = ['All', 'Small Van', 'Medium Van', 'Large Van', 'Luton Van'];
const SORT_OPTIONS = [
  { key: 'newest',  label: 'Newest' },
  { key: 'highest', label: 'Highest pay' },
  { key: 'lowest',  label: 'Lowest pay' },
];

export default function DriverAvailableJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [vanFilter, setVanFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchJobs = () =>
    api.get('/api/jobs')
      .then((r) => setJobs(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const acceptJob = async (jobId: string) => {
    setAccepting(jobId);
    try {
      await api.post(`/api/jobs/${jobId}/accept`);
      router.push(`/driver/my-jobs/${jobId}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e?.response?.data?.error || 'Could not accept job.');
      setAccepting(null);
      fetchJobs();
    }
  };

  const filtered = useMemo(() => {
    let result = [...jobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((j) =>
        j.pickupAddress?.toLowerCase().includes(q) ||
        j.dropoffAddress?.toLowerCase().includes(q) ||
        j.loadDescription?.toLowerCase().includes(q)
      );
    }
    if (vanFilter !== 'All') {
      result = result.filter((j) => j.vanSize === vanFilter || j.vanSize === 'Any Van');
    }
    if (sortBy === 'highest') result.sort((a, b) => b.driverEarnings - a.driverEarnings);
    else if (sortBy === 'lowest') result.sort((a, b) => a.driverEarnings - b.driverEarnings);
    return result;
  }, [jobs, search, vanFilter, sortBy]);

  const hasFilters = search.trim() || vanFilter !== 'All' || sortBy !== 'newest';

  const clearFilters = () => { setSearch(''); setVanFilter('All'); setSortBy('newest'); };

  return (
    <DashboardLayout>
      <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Dark header with search */}
        <div className="px-6 pt-7 pb-5" style={{ background: '#0F172A' }}>
          <div className="flex items-center justify-between mb-4 max-w-3xl mx-auto">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Available Jobs</p>
              <p className="text-xl font-extrabold text-white">
                {loading ? '…' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <button onClick={fetchJobs}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              ↻ Refresh
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-3xl mx-auto mb-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location or load…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'rgba(255,255,255,0.5)' }}>✕</button>
            )}
          </div>

          {/* Van filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-3xl mx-auto" style={{ scrollbarWidth: 'none' }}>
            {VAN_FILTERS.map((v) => (
              <button key={v} onClick={() => setVanFilter(v)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: vanFilter === v ? 'white' : 'rgba(255,255,255,0.1)',
                  color: vanFilter === v ? '#0F172A' : 'rgba(255,255,255,0.7)',
                  border: '1px solid',
                  borderColor: vanFilter === v ? 'white' : 'rgba(255,255,255,0.12)',
                }}>
                {v}
              </button>
            ))}
          </div>

          {/* Sort chips */}
          <div className="flex items-center gap-2 mt-2.5 max-w-3xl mx-auto">
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>Sort:</span>
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.key} onClick={() => setSortBy(opt.key)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: sortBy === opt.key ? '#F97316' : 'rgba(255,255,255,0.08)',
                  color: sortBy === opt.key ? 'white' : 'rgba(255,255,255,0.6)',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job list */}
        <div className="px-6 py-5 max-w-3xl mx-auto flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mb-3"
                style={{ borderColor: '#1E3A8A', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#94A3B8' }}>Loading jobs…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: '#E2E8F0' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ background: '#F1F5F9' }}>
                {hasFilters ? '🔎' : '📭'}
              </div>
              <p className="font-bold mb-1" style={{ color: '#0F172A' }}>
                {hasFilters ? 'No jobs match your filters' : 'No jobs available right now'}
              </p>
              <p className="text-sm mb-4" style={{ color: '#64748B' }}>
                {hasFilters ? 'Try adjusting your search or filters' : 'New jobs appear here when businesses post them.'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                  style={{ background: '#1E3A8A' }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filtered.map((job) => {
              const businessName = job.business?.businessProfile?.businessName || job.business?.name || '';
              return (
                <div key={job.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>

                  {/* Route + pay */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#1E3A8A' }} />
                        <span className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>
                          {job.pickupAddress?.split(',')[0]}
                        </span>
                      </div>
                      <div className="ml-1.5 w-0.5 h-4 mb-1" style={{ background: '#E2E8F0' }} />
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#F97316' }} />
                        <span className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>
                          {job.dropoffAddress?.split(',')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2.5 rounded-xl text-center"
                      style={{ background: '#1E3A8A' }}>
                      <p className="text-xl font-extrabold text-white leading-none">£{job.driverEarnings?.toFixed(0)}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>yours</p>
                    </div>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                      style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                      🚐 {job.vanSize}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                      style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                      ⏱ {job.urgency}
                    </span>
                  </div>

                  {/* Load */}
                  {job.loadDescription && (
                    <p className="text-sm mb-3 flex items-start gap-2" style={{ color: '#64748B' }}>
                      <span className="flex-shrink-0 mt-0.5">📦</span>
                      <span className="line-clamp-2">{job.loadDescription}</span>
                    </p>
                  )}

                  {/* Business */}
                  {businessName && (
                    <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#64748B' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: '#1E3A8A', fontSize: 9 }}>
                        {businessName.charAt(0).toUpperCase()}
                      </div>
                      <span>{businessName}</span>
                      {job.business?.businessProfile?.averageRating > 0 && (
                        <span>· ⭐ {job.business.businessProfile.averageRating.toFixed(1)}</span>
                      )}
                    </div>
                  )}

                  <button onClick={() => acceptJob(job.id)} disabled={accepting === job.id}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-opacity"
                    style={{ background: accepting === job.id ? '#94A3B8' : '#F97316' }}>
                    {accepting === job.id ? 'Accepting…' : 'Accept job →'}
                  </button>
                </div>
              );
            })
          )}

          <div className="h-4" />
        </div>
      </div>
    </DashboardLayout>
  );
}
