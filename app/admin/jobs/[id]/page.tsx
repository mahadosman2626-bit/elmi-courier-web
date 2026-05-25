'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

const STATUS_STEPS = [
  { key: 'PENDING',    label: 'Job posted',       icon: '📋' },
  { key: 'ACCEPTED',   label: 'Driver assigned',   icon: '🚐' },
  { key: 'COLLECTING', label: 'Driver collecting', icon: '📍' },
  { key: 'IN_TRANSIT', label: 'In transit',        icon: '🚚' },
  { key: 'DELIVERED',  label: 'Delivered',         icon: '✅' },
];
const STATUS_ORDER = ['PENDING', 'ACCEPTED', 'COLLECTING', 'IN_TRANSIT', 'DELIVERED'];

function fmt(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]" style={{ color: '#0F172A' }}>{value}</span>
    </div>
  );
}

export default function AdminJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/api/admin/jobs/${id}`);
      setJob(res.data);
    } catch {
      try {
        const res = await api.get(`/api/jobs/${id}`);
        setJob(res.data);
      } catch {
        setJob(null);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/jobs/${id}/messages`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    Promise.all([fetchJob(), fetchMessages()]).finally(() => setLoading(false));
  }, [id]);

  const cancelJob = async () => {
    if (!confirm('Force-cancel this job? This cannot be undone.')) return;
    setCancelling(true);
    try {
      await api.post(`/api/admin/jobs/${id}/cancel`);
      fetchJob();
    } catch {
      try {
        await api.post(`/api/jobs/${id}/cancel`);
        fetchJob();
      } catch { alert('Failed to cancel job.'); }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="p-8"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p></div>
    </DashboardLayout>
  );

  if (!job) return (
    <DashboardLayout>
      <div className="p-8 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-semibold">Job not found</p>
        <button onClick={() => router.back()} className="mt-4 text-sm font-bold hover:underline" style={{ color: 'var(--primary)' }}>← Back</button>
      </div>
    </DashboardLayout>
  );

  const currentIndex = STATUS_ORDER.indexOf(job.status);
  const isCancelled = job.status === 'CANCELLED';
  const canCancel = !['DELIVERED', 'CANCELLED'].includes(job.status);
  const businessName = job.business?.businessProfile?.businessName || job.business?.name || '—';

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl border text-sm font-bold"
            style={{ borderColor: 'var(--border)' }}>←</button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-bold" style={{ color: '#64748B' }}>JOB #{id.slice(-8).toUpperCase()}</p>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}
            </h1>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Left column */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Status timeline */}
            {!isCancelled ? (
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Timeline</p>
                <div className="flex flex-col">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentIndex;
                    const active = i === currentIndex;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                            style={{ background: done ? '#1E3A8A' : '#F1F5F9', boxShadow: active ? '0 0 0 4px rgba(30,58,138,0.15)' : 'none' }}>
                            <span style={{ filter: done ? 'brightness(10)' : 'none', opacity: done ? 1 : 0.3 }}>{step.icon}</span>
                          </div>
                          {!isLast && <div className="w-0.5 h-7" style={{ background: done && i < currentIndex ? '#1E3A8A' : '#E2E8F0' }} />}
                        </div>
                        <div className="pt-1.5 pb-7" style={{ paddingBottom: isLast ? 0 : undefined }}>
                          <p className="text-sm font-semibold" style={{ color: done ? '#0F172A' : '#94A3B8' }}>
                            {step.label}
                            {active && <span className="ml-2 text-xs font-bold" style={{ color: '#F97316' }}>← Current</span>}
                          </p>
                          {active && job.status === 'DELIVERED' && job.deliveredAt && (
                            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{fmt(job.deliveredAt)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border p-5 flex items-center gap-3" style={{ borderColor: '#FCA5A5' }}>
                <span className="text-3xl">🚫</span>
                <div>
                  <p className="font-bold" style={{ color: '#DC2626' }}>Job cancelled</p>
                  <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>This job was cancelled and is no longer active.</p>
                </div>
              </div>
            )}

            {/* Job details */}
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Job Details</p>
              <InfoRow label="Pickup address" value={job.pickupAddress} />
              {job.pickupContact && <InfoRow label="Pickup contact" value={job.pickupContact} />}
              <InfoRow label="Drop-off address" value={job.dropoffAddress} />
              {job.dropoffContact && <InfoRow label="Drop-off contact" value={job.dropoffContact} />}
              <InfoRow label="Load description" value={job.loadDescription} />
              <InfoRow label="Van size" value={job.vanSize} />
              <InfoRow label="Urgency" value={job.urgency} />
              {job.scheduledAt && <InfoRow label="Scheduled at" value={fmt(job.scheduledAt)} />}
              {job.notes && <InfoRow label="Notes" value={job.notes} />}
              <InfoRow label="Posted at" value={fmt(job.createdAt)} />
              {job.deliveredAt && <InfoRow label="Delivered at" value={fmt(job.deliveredAt)} />}
            </div>

            {/* Chat log */}
            {messages.length > 0 && (
              <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>
                    Chat Log ({messages.length} messages)
                  </p>
                </div>
                <div className="p-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {messages.map((m: any) => (
                    <div key={m.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{m.sender?.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: m.sender?.role === 'DRIVER' ? '#FFF7ED' : '#EFF6FF', color: m.sender?.role === 'DRIVER' ? '#F97316' : '#1E3A8A', fontSize: 10 }}>
                          {m.sender?.role}
                        </span>
                        <span className="text-xs" style={{ color: '#94A3B8' }}>
                          {new Date(m.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm px-3 py-2 rounded-xl w-fit max-w-[85%]"
                        style={{ background: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Payment */}
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Payment</p>
              <p className="text-3xl font-extrabold mb-3" style={{ color: '#0F172A' }}>£{job.totalPrice?.toFixed(2)}</p>
              <InfoRow label="Driver earns" value={`£${job.driverEarnings?.toFixed(2) ?? '—'}`} />
              <InfoRow label="Platform fee" value={`£${job.platformFee?.toFixed(2) ?? '—'}`} />
            </div>

            {/* Business */}
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Business</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: '#1E3A8A' }}>
                  {businessName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{businessName}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{job.business?.email || '—'}</p>
                </div>
              </div>
              <button onClick={() => router.push(`/admin/businesses`)}
                className="text-xs font-semibold hover:underline" style={{ color: '#1E3A8A' }}>
                View business →
              </button>
            </div>

            {/* Driver */}
            {job.driver ? (
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Driver</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: '#F97316' }}>
                    {job.driver.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{job.driver.name}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>
                      ⭐ {job.driver.driverProfile?.averageRating?.toFixed(1) ?? '—'} · {job.driver.driverProfile?.totalJobs ?? 0} jobs
                    </p>
                  </div>
                </div>
                {job.driver.driverProfile?.vanType && (
                  <p className="text-xs mb-1" style={{ color: '#64748B' }}>🚐 {job.driver.driverProfile.vanType}</p>
                )}
                <button onClick={() => router.push(`/admin/drivers`)}
                  className="text-xs font-semibold hover:underline" style={{ color: '#1E3A8A' }}>
                  View driver →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#64748B' }}>Driver</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>No driver assigned yet</p>
              </div>
            )}

            {/* Ratings */}
            {job.ratings?.length > 0 && (
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Rating</p>
                {job.ratings.map((r: any) => (
                  <div key={r.id}>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} style={{ opacity: s <= r.score ? 1 : 0.2 }}>⭐</span>
                      ))}
                    </div>
                    {r.comment && <p className="text-xs" style={{ color: '#64748B' }}>"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Admin actions */}
            {canCancel && (
              <button onClick={cancelJob} disabled={cancelling}
                className="w-full py-3.5 rounded-2xl text-sm font-bold border-2 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                {cancelling ? 'Cancelling…' : '🚫 Force cancel job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
