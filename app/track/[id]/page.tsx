'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE = 'https://elmi-courier-backend-production.up.railway.app';

const STATUS_STEPS = [
  { key: 'PENDING',    label: 'Job posted',      icon: '📋' },
  { key: 'ACCEPTED',   label: 'Driver assigned',  icon: '🚐' },
  { key: 'COLLECTING', label: 'Driver en route',  icon: '📍' },
  { key: 'IN_TRANSIT', label: 'In transit',       icon: '🚚' },
  { key: 'DELIVERED',  label: 'Delivered',        icon: '✅' },
];

const STATUS_ORDER = ['PENDING', 'ACCEPTED', 'COLLECTING', 'IN_TRANSIT', 'DELIVERED'];

interface Job {
  id: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  loadDescription: string;
  vanSize: string;
  scheduledAt: string | null;
  createdAt: string;
  deliveredAt: string | null;
  driver: {
    name: string;
    driverProfile?: { vanType: string; averageRating: number; totalJobs: number };
  } | null;
}

function fmt(date: string) {
  return new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchJob = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/jobs/${id}/track`);
      setJob(res.data);
      setError(false);
    } catch {
      try {
        const res = await axios.get(`${API_BASE}/api/jobs/${id}`);
        setJob(res.data);
        setError(false);
      } catch {
        setError(true);
      }
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const currentIndex = job ? STATUS_ORDER.indexOf(job.status) : -1;
  const isCancelled = job?.status === 'CANCELLED';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4" style={{ background: '#0F172A' }}>
        <button onClick={() => router.push('/')}
          className="text-xl font-extrabold tracking-tight text-white">
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
          Live tracking
        </span>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mb-4"
              style={{ borderColor: '#1E3A8A', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#64748B' }}>Loading tracking info…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-10 border text-center" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-extrabold mb-2">Delivery not found</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              This tracking link may have expired or the job ID is incorrect. Check your confirmation email for the correct link.
            </p>
            <a href="mailto:support@elmicourier.co.uk"
              className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold"
              style={{ background: '#1E3A8A' }}>
              Contact support
            </a>
          </div>
        )}

        {!loading && job && (
          <>
            {/* Header card */}
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
              <div className="px-6 py-5" style={{ background: '#0F172A' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Job #{id.slice(-6).toUpperCase()}
                  </p>
                  {isCancelled
                    ? <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FEF2F2', color: '#DC2626' }}>Cancelled</span>
                    : job.status === 'DELIVERED'
                      ? <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#F0FDF4', color: '#16A34A' }}>Delivered</span>
                      : <span className="px-3 py-1 rounded-full text-xs font-bold animate-pulse" style={{ background: 'rgba(249,115,22,0.2)', color: '#F97316' }}>Live</span>
                  }
                </div>
                <h1 className="text-white font-extrabold text-lg leading-snug">
                  {job.pickupAddress.split(',')[0]} → {job.dropoffAddress.split(',')[0]}
                </h1>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>

              {/* Addresses */}
              <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                <div className="flex items-start gap-3 px-6 py-4">
                  <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white" style={{ background: '#1E3A8A' }}>A</span>
                  <div>
                    <p className="text-xs font-bold mb-0.5" style={{ color: '#64748B' }}>Collection</p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{job.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-6 py-4">
                  <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white" style={{ background: '#F97316' }}>B</span>
                  <div>
                    <p className="text-xs font-bold mb-0.5" style={{ color: '#64748B' }}>Delivery</p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{job.dropoffAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status timeline */}
            {!isCancelled && (
              <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#64748B' }}>Status</p>
                <div className="flex flex-col gap-0">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentIndex;
                    const active = i === currentIndex;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                            style={{
                              background: done ? '#1E3A8A' : '#F1F5F9',
                              boxShadow: active ? '0 0 0 4px rgba(30,58,138,0.15)' : 'none',
                            }}>
                            {done ? <span style={{ filter: 'brightness(10)' }}>{step.icon}</span> : <span style={{ opacity: 0.3 }}>{step.icon}</span>}
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-8" style={{ background: done && i < currentIndex ? '#1E3A8A' : '#E2E8F0' }} />
                          )}
                        </div>
                        <div className="pt-1.5 pb-8" style={{ paddingBottom: isLast ? 0 : 'auto' }}>
                          <p className="text-sm font-semibold" style={{ color: done ? '#0F172A' : '#94A3B8' }}>
                            {step.label}
                            {active && <span className="ml-2 text-xs font-bold" style={{ color: '#F97316' }}>← Now</span>}
                          </p>
                          {active && job.status === 'DELIVERED' && job.deliveredAt && (
                            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{fmt(job.deliveredAt)}</p>
                          )}
                          {active && job.status === 'PENDING' && (
                            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Waiting for a driver to accept</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Driver card */}
            {job.driver && (
              <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Your driver</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
                    style={{ background: '#1E3A8A' }}>
                    {job.driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-base" style={{ color: '#0F172A' }}>{job.driver.name}</p>
                    <p className="text-sm" style={{ color: '#64748B' }}>
                      ⭐ {job.driver.driverProfile?.averageRating?.toFixed(1) ?? '—'} · {job.driver.driverProfile?.totalJobs ?? 0} jobs completed
                    </p>
                    {job.driver.driverProfile?.vanType && (
                      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{job.driver.driverProfile.vanType}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-center px-4 py-2 rounded-xl" style={{ background: '#F0FDF4' }}>
                    <span className="text-xs font-bold" style={{ color: '#16A34A' }}>Verified</span>
                    <span className="text-xs mt-0.5" style={{ color: '#16A34A' }}>✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* Job info */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Delivery details</p>
              <dl className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt style={{ color: '#64748B' }}>Load</dt>
                  <dd className="font-medium text-right max-w-[60%]" style={{ color: '#0F172A' }}>{job.loadDescription}</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: '#64748B' }}>Van size</dt>
                  <dd className="font-medium" style={{ color: '#0F172A' }}>{job.vanSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: '#64748B' }}>Booked</dt>
                  <dd className="font-medium" style={{ color: '#0F172A' }}>{fmt(job.createdAt)}</dd>
                </div>
                {job.deliveredAt && (
                  <div className="flex justify-between">
                    <dt style={{ color: '#64748B' }}>Delivered</dt>
                    <dd className="font-medium" style={{ color: '#16A34A' }}>{fmt(job.deliveredAt)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Help */}
            <div className="text-center pb-4">
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Problem with this delivery?{' '}
                <a href="mailto:support@elmicourier.co.uk" className="font-semibold hover:underline" style={{ color: '#1E3A8A' }}>
                  Contact support
                </a>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center border-t" style={{ borderColor: '#E2E8F0' }}>
        <button onClick={() => router.push('/')} className="text-sm font-extrabold" style={{ color: '#1E3A8A' }}>
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>
        <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Same-day van delivery · UK</p>
      </div>
    </div>
  );
}
