'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function DriverAvailableJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchJobs = () => api.get('/api/jobs').then((r) => { setJobs(r.data); setLoading(false); }).catch(() => setLoading(false));

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

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Available jobs</h1>
          <button onClick={fetchJobs} className="px-4 py-2 rounded-xl border text-xs font-bold"
            style={{ borderColor: 'var(--border)' }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: 'var(--border)' }}>
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No jobs available right now</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>New jobs will appear here when businesses post them.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold">{job.pickupAddress?.split(',')[0]}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>↓</p>
                    <p className="font-bold">{job.dropoffAddress?.split(',')[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold" style={{ color: '#16A34A' }}>
                      £{job.driverEarnings?.toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>your earnings</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="px-2.5 py-1 rounded-lg font-medium" style={{ background: 'var(--background)' }}>{job.vanSize}</span>
                  <span className="px-2.5 py-1 rounded-lg font-medium" style={{ background: 'var(--background)' }}>{job.urgency}</span>
                  <span className="px-2.5 py-1 rounded-lg font-medium" style={{ background: 'var(--background)' }}>
                    Posted {new Date(job.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>

                {job.loadDescription && (
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{job.loadDescription}</p>
                )}

                {job.business && (
                  <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'var(--primary)' }}>
                      {job.business.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{job.business.businessProfile?.businessName || job.business.name}</span>
                    {job.business.businessProfile?.averageRating > 0 && (
                      <span>⭐ {job.business.businessProfile.averageRating.toFixed(1)}</span>
                    )}
                  </div>
                )}

                <button onClick={() => acceptJob(job.id)} disabled={accepting === job.id}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}>
                  {accepting === job.id ? 'Accepting…' : 'Accept job'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
