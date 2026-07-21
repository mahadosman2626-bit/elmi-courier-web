'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE = 'https://elmi-courier-backend-production.up.railway.app';

const STATUS_STEPS = [
  {
    key: 'POSTED',
    label: 'Job posted',
    icon: '📋',
    sub: 'Your delivery has been submitted and is waiting for a driver.',
  },
  {
    key: 'ACCEPTED',
    label: 'Driver assigned',
    icon: '🚐',
    sub: 'A driver has accepted your delivery and is preparing to collect.',
  },
  {
    key: 'COLLECTING',
    label: 'At collection point',
    icon: '📍',
    sub: 'Your driver has arrived at the collection address.',
  },
  {
    key: 'IN_TRANSIT',
    label: 'On the way',
    icon: '🚚',
    sub: 'Your items are loaded and the driver is heading to the delivery address.',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    icon: '✅',
    sub: 'Your delivery is complete. Thank you for using Elmi.',
  },
];

const STATUS_ORDER = ['POSTED', 'ACCEPTED', 'COLLECTING', 'IN_TRANSIT', 'DELIVERED'];

interface Job {
  id: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  loadDescription: string;
  vanSize: string;
  notes: string | null;
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchJob = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
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
      setRefreshing(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(() => fetchJob(false), 15000);
    return () => clearInterval(interval);
  }, [id]);

  const currentIndex = job ? STATUS_ORDER.indexOf(job.status) : -1;
  const isCancelled = job?.status === 'CANCELLED';
  const isDelivered = job?.status === 'DELIVERED';
  const isActive = job && !isCancelled && !isDelivered;
  const progressPct = currentIndex >= 0 ? Math.round(((currentIndex) / (STATUS_STEPS.length - 1)) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ background: '#0F172A' }}>
        <button onClick={() => router.push('/')} className="text-xl font-extrabold tracking-tight text-white">
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
              Live
            </span>
          )}
          {isDelivered && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(22,163,74,0.15)', color: '#34D399' }}>
              Delivered
            </span>
          )}
          {isCancelled && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(220,38,38,0.15)', color: '#F87171' }}>
              Cancelled
            </span>
          )}
        </div>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-5">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 animate-spin mb-4"
              style={{ borderColor: '#1E3A8A', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#64748B' }}>Loading tracking info…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-10 border text-center" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="text-xl font-extrabold mb-2">Delivery not found</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              This tracking link may have expired or is incorrect. Check your confirmation message for the correct link.
            </p>
            <a href="mailto:support@elmicouriers.co.uk"
              className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold"
              style={{ background: '#1E3A8A' }}>
              Contact support
            </a>
          </div>
        )}

        {!loading && job && (
          <>
            {/* Delivered celebration */}
            {isDelivered && (
              <div className="rounded-2xl px-6 py-5 flex items-center gap-4"
                style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)', border: '1px solid #166534' }}>
                <span className="text-4xl">🎉</span>
                <div>
                  <p className="text-white font-extrabold text-lg">Delivered!</p>
                  <p className="text-sm mt-0.5" style={{ color: '#86EFAC' }}>
                    {job.deliveredAt ? `Completed at ${fmt(job.deliveredAt)}` : 'Your delivery is complete.'}
                  </p>
                </div>
              </div>
            )}

            {/* Cancelled state */}
            {isCancelled && (
              <div className="rounded-2xl px-6 py-5 flex items-center gap-4"
                style={{ background: '#FEF2F2', border: '2px solid #FECACA' }}>
                <span className="text-4xl">❌</span>
                <div>
                  <p className="font-extrabold text-sm" style={{ color: '#991B1B' }}>Delivery cancelled</p>
                  <p className="text-xs mt-0.5" style={{ color: '#DC2626' }}>
                    This delivery was cancelled. Please contact the business if you need to rearrange.
                  </p>
                </div>
              </div>
            )}

            {/* Header card */}
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
              <div className="px-6 py-5" style={{ background: '#0F172A' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Ref #{id.slice(-6).toUpperCase()}
                  </p>
                  <button onClick={() => fetchJob(true)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', opacity: refreshing ? 0.5 : 1 }}>
                    {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
                  </button>
                </div>
                <h1 className="text-white font-extrabold text-lg leading-snug">
                  {job.pickupAddress.split(',')[0]} → {job.dropoffAddress.split(',')[0]}
                </h1>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Last updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  {isActive && <span className="ml-2" style={{ color: 'rgba(249,115,22,0.7)' }}>· auto-refreshes every 15s</span>}
                </p>
              </div>

              {/* Progress bar */}
              {!isCancelled && (
                <div className="h-1.5 w-full" style={{ background: '#1E293B' }}>
                  <div className="h-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background: isDelivered ? '#16A34A' : 'linear-gradient(90deg, #1E3A8A, #3B82F6)',
                    }} />
                </div>
              )}

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
                <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#64748B' }}>Delivery progress</p>
                <div className="flex flex-col">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentIndex;
                    const active = i === currentIndex;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
                            style={{
                              background: done ? (isDelivered && active ? '#16A34A' : '#1E3A8A') : '#F1F5F9',
                              boxShadow: active && !isDelivered ? '0 0 0 5px rgba(30,58,138,0.12)' : 'none',
                            }}>
                            <span style={{ filter: done ? 'brightness(10)' : 'none', opacity: done ? 1 : 0.25 }}>
                              {step.icon}
                            </span>
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-10 transition-colors"
                              style={{ background: done && i < currentIndex ? '#1E3A8A' : '#E2E8F0' }} />
                          )}
                        </div>
                        <div className={`pt-1.5 ${isLast ? 'pb-0' : 'pb-0'} flex-1 min-w-0`} style={{ paddingBottom: isLast ? 0 : '2rem' }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold" style={{ color: done ? '#0F172A' : '#CBD5E1' }}>
                              {step.label}
                            </p>
                            {active && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: isDelivered ? '#DCFCE7' : 'rgba(249,115,22,0.12)',
                                  color: isDelivered ? '#16A34A' : '#F97316',
                                }}>
                                {isDelivered ? 'Complete' : 'Now'}
                              </span>
                            )}
                          </div>
                          {active && (
                            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{step.sub}</p>
                          )}
                          {active && step.key === 'DELIVERED' && job.deliveredAt && (
                            <p className="text-xs mt-0.5 font-medium" style={{ color: '#16A34A' }}>{fmt(job.deliveredAt)}</p>
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
                    <p className="font-extrabold text-sm" style={{ color: '#0F172A' }}>{job.driver.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                      ⭐ {job.driver.driverProfile?.averageRating?.toFixed(1) ?? '—'} · {job.driver.driverProfile?.totalJobs ?? 0} completed jobs
                    </p>
                    {job.driver.driverProfile?.vanType && (
                      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>🚐 {job.driver.driverProfile.vanType}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-center px-3 py-2 rounded-xl flex-shrink-0"
                    style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <span className="text-xs font-bold" style={{ color: '#16A34A' }}>Verified</span>
                    <span className="text-base">✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery details */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Delivery details</p>
              <dl className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt style={{ color: '#64748B' }}>Load</dt>
                  <dd className="font-medium text-right" style={{ color: '#0F172A' }}>{job.loadDescription}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt style={{ color: '#64748B' }}>Van size</dt>
                  <dd className="font-medium" style={{ color: '#0F172A' }}>{job.vanSize}</dd>
                </div>
                {job.notes && (
                  <div className="flex justify-between gap-4">
                    <dt style={{ color: '#64748B' }}>Notes</dt>
                    <dd className="font-medium text-right" style={{ color: '#0F172A' }}>{job.notes}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt style={{ color: '#64748B' }}>Booked</dt>
                  <dd className="font-medium" style={{ color: '#0F172A' }}>{fmt(job.createdAt)}</dd>
                </div>
                {job.scheduledAt && (
                  <div className="flex justify-between gap-4">
                    <dt style={{ color: '#64748B' }}>Scheduled for</dt>
                    <dd className="font-medium" style={{ color: '#0F172A' }}>{fmt(job.scheduledAt)}</dd>
                  </div>
                )}
                {job.deliveredAt && (
                  <div className="flex justify-between gap-4">
                    <dt style={{ color: '#64748B' }}>Delivered at</dt>
                    <dd className="font-semibold" style={{ color: '#16A34A' }}>{fmt(job.deliveredAt)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Help */}
            <div className="text-center pb-2">
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Problem with this delivery?{' '}
                <a href="mailto:support@elmicouriers.co.uk" className="font-semibold hover:underline" style={{ color: '#1E3A8A' }}>
                  Contact support
                </a>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="py-5 text-center border-t" style={{ borderColor: '#E2E8F0' }}>
        <button onClick={() => router.push('/')} className="text-sm font-extrabold" style={{ color: '#1E3A8A' }}>
          elmi<span style={{ color: '#F97316' }}>.</span>
        </button>
        <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Trusted delivery · UK</p>
      </div>
    </div>
  );
}
