'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

interface DriverProfile {
  isApproved: boolean;
  licenceVerified: boolean;
  insuranceVerified: boolean;
  gitVerified: boolean;
  licencePhotoUrl: string | null;
  insurancePhotoUrl: string | null;
  gitPhotoUrl: string | null;
  documentsSubmittedAt: string | null;
  vanType: string | null;
  vanRegistration: string | null;
  totalJobs: number;
  averageRating: number;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  driverProfile: DriverProfile | null;
}

const FILTERS = [
  { key: 'PENDING', label: 'Pending review', color: '#D97706', bg: '#FFF7ED' },
  { key: 'APPROVED', label: 'Approved', color: '#16A34A', bg: '#F0FDF4' },
  { key: 'NO_DOCS', label: 'No docs', color: '#64748B', bg: '#F1F5F9' },
  { key: 'ALL', label: 'All', color: '#1E3A8A', bg: '#EFF6FF' },
];

export default function AdminDriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const fetchDrivers = () =>
    api.get('/api/admin/drivers')
      .then((r) => setDrivers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchDrivers(); }, []);

  const counts = useMemo(() => ({
    PENDING: drivers.filter((d) => d.driverProfile?.documentsSubmittedAt && !d.driverProfile?.isApproved).length,
    APPROVED: drivers.filter((d) => d.driverProfile?.isApproved).length,
    NO_DOCS: drivers.filter((d) => !d.driverProfile?.documentsSubmittedAt && !d.driverProfile?.isApproved).length,
    ALL: drivers.length,
  }), [drivers]);

  const filtered = useMemo(() => {
    let list =
      filter === 'PENDING' ? drivers.filter((d) => d.driverProfile?.documentsSubmittedAt && !d.driverProfile?.isApproved)
      : filter === 'APPROVED' ? drivers.filter((d) => d.driverProfile?.isApproved)
      : filter === 'NO_DOCS' ? drivers.filter((d) => !d.driverProfile?.documentsSubmittedAt && !d.driverProfile?.isApproved)
      : drivers;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) =>
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q) ||
        d.driverProfile?.vanRegistration?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [drivers, filter, search]);

  const updateDriver = async (userId: string, data: Record<string, boolean>) => {
    setUpdating(userId);
    try {
      await api.patch(`/api/admin/drivers/${userId}/verify`, data);
      fetchDrivers();
    } finally {
      setUpdating(null);
    }
  };

  const approveAll = (userId: string) =>
    updateDriver(userId, { isApproved: true, licenceVerified: true, insuranceVerified: true, gitVerified: true });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">

        {/* Dark header */}
        <div className="px-8 py-8" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}>
          <button onClick={() => router.back()} className="text-xs font-bold mb-4 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            ← Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-4">Drivers</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total drivers', value: drivers.length, color: '#60A5FA' },
              { label: 'Approved', value: counts.APPROVED, color: '#34D399' },
              { label: 'Pending review', value: counts.PENDING, color: '#FCD34D' },
              { label: 'No docs yet', value: counts.NO_DOCS, color: '#94A3B8' },
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
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#94A3B8' }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or reg…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', background: 'white' }}
              />
            </div>
            <div className="flex gap-2">
              {FILTERS.map(({ key, label, color }) => (
                <button key={key} onClick={() => setFilter(key)}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: filter === key ? color : 'white',
                    color: filter === key ? 'white' : color,
                    border: `1.5px solid ${color}`,
                  }}>
                  {label}
                  <span className="ml-1.5 opacity-70">{counts[key as keyof typeof counts]}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm py-12 text-center" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-3xl mb-3">🚐</p>
              <p className="font-semibold text-sm">No drivers found</p>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                {search ? 'Try a different search term' : 'No drivers match this filter'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map((driver) => {
                const p = driver.driverProfile;
                const isPending = p?.documentsSubmittedAt && !p?.isApproved;

                return (
                  <div key={driver.id} className="bg-white rounded-2xl border overflow-hidden"
                    style={{
                      borderColor: isPending ? '#D97706' : 'var(--border)',
                      borderWidth: isPending ? 2 : 1,
                    }}>

                    {/* Driver header */}
                    <div className="px-6 py-5 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
                        style={{ background: p?.isApproved ? '#16A34A' : isPending ? '#D97706' : '#94A3B8' }}>
                        {driver.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold text-sm">{driver.name}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: p?.isApproved ? '#F0FDF4' : isPending ? '#FFFBEB' : '#F1F5F9',
                              color: p?.isApproved ? '#16A34A' : isPending ? '#D97706' : '#64748B',
                            }}>
                            {p?.isApproved ? '✓ Approved' : isPending ? '⏳ Pending review' : 'No docs'}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{driver.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: '#94A3B8' }}>
                          {driver.phone && <span>{driver.phone}</span>}
                          {p?.vanType && <span>🚐 {p.vanType}</span>}
                          {p?.vanRegistration && <span>{p.vanRegistration}</span>}
                          {(p?.totalJobs ?? 0) > 0 && <span>📦 {p!.totalJobs} jobs</span>}
                          {(p?.averageRating ?? 0) > 0 && <span>⭐ {p!.averageRating.toFixed(1)}</span>}
                          <span>Joined {new Date(driver.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        {!p?.isApproved && p?.documentsSubmittedAt && (
                          <button
                            onClick={() => approveAll(driver.id)}
                            disabled={updating === driver.id}
                            className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 whitespace-nowrap"
                            style={{ background: '#16A34A' }}>
                            {updating === driver.id ? 'Saving…' : '✓ Approve all'}
                          </button>
                        )}
                        {p?.isApproved && (
                          <button
                            onClick={() => updateDriver(driver.id, { isApproved: false })}
                            disabled={updating === driver.id}
                            className="px-4 py-2 rounded-xl text-xs font-bold border disabled:opacity-50 whitespace-nowrap"
                            style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                            {updating === driver.id ? 'Saving…' : 'Revoke'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Documents */}
                    {p && (
                      <div className="px-6 pb-5">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>Documents</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { label: 'Driving licence', verifiedKey: 'licenceVerified', url: p.licencePhotoUrl, verified: p.licenceVerified },
                            { label: 'Insurance', verifiedKey: 'insuranceVerified', url: p.insurancePhotoUrl, verified: p.insuranceVerified },
                            { label: 'GIT certificate', verifiedKey: 'gitVerified', url: p.gitPhotoUrl, verified: p.gitVerified },
                          ].map((doc) => (
                            <div key={doc.verifiedKey} className="rounded-xl border overflow-hidden"
                              style={{
                                borderColor: doc.verified ? '#86EFAC' : doc.url ? '#FCD34D' : 'var(--border)',
                                borderWidth: doc.url && !doc.verified ? 2 : 1,
                              }}>
                              {/* Photo preview */}
                              {doc.url ? (
                                <button
                                  onClick={() => setExpandedPhoto(expandedPhoto === doc.url ? null : doc.url!)}
                                  className="w-full h-24 flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
                                  style={{ background: '#F8FAFC', color: '#1E3A8A' }}>
                                  {expandedPhoto === doc.url ? (
                                    <img src={doc.url} alt={doc.label}
                                      className="w-full h-24 object-cover" />
                                  ) : (
                                    <span>📄 View photo</span>
                                  )}
                                </button>
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center"
                                  style={{ background: '#F8FAFC' }}>
                                  <span className="text-xs" style={{ color: '#CBD5E1' }}>Not uploaded</span>
                                </div>
                              )}
                              <div className="px-3 py-2.5 flex items-center justify-between gap-2"
                                style={{ background: doc.verified ? '#F0FDF4' : 'white' }}>
                                <div>
                                  <p className="text-xs font-bold" style={{ color: '#0F172A' }}>{doc.label}</p>
                                  {doc.url && (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                                      className="text-xs" style={{ color: '#1E3A8A' }}
                                      onClick={(e) => e.stopPropagation()}>
                                      Open ↗
                                    </a>
                                  )}
                                </div>
                                {doc.url && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    {!doc.verified ? (
                                      <button
                                        onClick={() => updateDriver(driver.id, { [doc.verifiedKey]: true })}
                                        disabled={updating === driver.id}
                                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                                        style={{ background: '#16A34A' }}>
                                        ✓ OK
                                      </button>
                                    ) : (
                                      <>
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                          style={{ background: '#DCFCE7', color: '#16A34A' }}>
                                          ✓ Verified
                                        </span>
                                        <button
                                          onClick={() => updateDriver(driver.id, { [doc.verifiedKey]: false })}
                                          disabled={updating === driver.id}
                                          className="px-2 py-1 rounded-lg text-xs font-bold border disabled:opacity-50"
                                          style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                                          ✕
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {p.documentsSubmittedAt && (
                          <p className="text-xs mt-3" style={{ color: '#94A3B8' }}>
                            Documents submitted {new Date(p.documentsSubmittedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
