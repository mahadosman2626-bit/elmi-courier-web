'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

interface BusinessProfile {
  businessName: string | null;
  isVerified: boolean;
  businessRegPhotoUrl: string | null;
  addressProofPhotoUrl: string | null;
  documentsSubmittedAt: string | null;
  totalJobs: number;
  averageRating: number;
}

interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  businessProfile: BusinessProfile | null;
}

const FILTERS = [
  { key: 'PENDING', label: 'Pending review', color: '#D97706' },
  { key: 'VERIFIED', label: 'Verified', color: '#16A34A' },
  { key: 'NO_DOCS', label: 'No docs', color: '#64748B' },
  { key: 'ALL', label: 'All', color: '#1E3A8A' },
];

export default function AdminBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const fetchBusinesses = () =>
    api.get('/api/admin/businesses')
      .then((r) => setBusinesses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchBusinesses(); }, []);

  const counts = useMemo(() => ({
    PENDING: businesses.filter((b) => b.businessProfile?.documentsSubmittedAt && !b.businessProfile?.isVerified).length,
    VERIFIED: businesses.filter((b) => b.businessProfile?.isVerified).length,
    NO_DOCS: businesses.filter((b) => !b.businessProfile?.documentsSubmittedAt && !b.businessProfile?.isVerified).length,
    ALL: businesses.length,
  }), [businesses]);

  const filtered = useMemo(() => {
    let list =
      filter === 'PENDING' ? businesses.filter((b) => b.businessProfile?.documentsSubmittedAt && !b.businessProfile?.isVerified)
      : filter === 'VERIFIED' ? businesses.filter((b) => b.businessProfile?.isVerified)
      : filter === 'NO_DOCS' ? businesses.filter((b) => !b.businessProfile?.documentsSubmittedAt && !b.businessProfile?.isVerified)
      : businesses;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q) ||
        b.businessProfile?.businessName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [businesses, filter, search]);

  const updateBusiness = async (userId: string, isVerified: boolean) => {
    setUpdating(userId);
    try {
      await api.patch(`/api/admin/businesses/${userId}/verify`, { isVerified });
      fetchBusinesses();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">

        {/* Dark header */}
        <div className="px-8 py-8" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}>
          <button onClick={() => router.back()} className="text-xs font-bold mb-4 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            ← Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-4">Businesses</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total businesses', value: businesses.length, color: '#60A5FA' },
              { label: 'Verified', value: counts.VERIFIED, color: '#34D399' },
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
                placeholder="Search by name, email, or business name…"
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
              <p className="text-3xl mb-3">🏪</p>
              <p className="font-semibold text-sm">No businesses found</p>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                {search ? 'Try a different search term' : 'No businesses match this filter'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map((biz) => {
                const p = biz.businessProfile;
                const isPending = p?.documentsSubmittedAt && !p?.isVerified;

                return (
                  <div key={biz.id} className="bg-white rounded-2xl border overflow-hidden"
                    style={{
                      borderColor: isPending ? '#D97706' : 'var(--border)',
                      borderWidth: isPending ? 2 : 1,
                    }}>

                    {/* Business header */}
                    <div className="px-6 py-5 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
                        style={{ background: p?.isVerified ? '#16A34A' : isPending ? '#D97706' : '#94A3B8' }}>
                        {(p?.businessName || biz.name)?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold text-sm">{p?.businessName || biz.name}</p>
                          {p?.businessName && p.businessName !== biz.name && (
                            <span className="text-xs" style={{ color: '#94A3B8' }}>{biz.name}</span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: p?.isVerified ? '#F0FDF4' : isPending ? '#FFFBEB' : '#F1F5F9',
                              color: p?.isVerified ? '#16A34A' : isPending ? '#D97706' : '#64748B',
                            }}>
                            {p?.isVerified ? '✓ Verified' : isPending ? '⏳ Pending review' : 'Unverified'}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{biz.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: '#94A3B8' }}>
                          {biz.phone && <span>{biz.phone}</span>}
                          {(p?.totalJobs ?? 0) > 0 && <span>📦 {p!.totalJobs} jobs</span>}
                          {(p?.averageRating ?? 0) > 0 && <span>⭐ {p!.averageRating.toFixed(1)}</span>}
                          <span>Joined {new Date(biz.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {!p?.isVerified ? (
                          <button
                            onClick={() => updateBusiness(biz.id, true)}
                            disabled={updating === biz.id}
                            className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 whitespace-nowrap"
                            style={{ background: '#16A34A' }}>
                            {updating === biz.id ? 'Saving…' : '✓ Verify'}
                          </button>
                        ) : (
                          <button
                            onClick={() => updateBusiness(biz.id, false)}
                            disabled={updating === biz.id}
                            className="px-4 py-2 rounded-xl text-xs font-bold border disabled:opacity-50 whitespace-nowrap"
                            style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                            {updating === biz.id ? 'Saving…' : 'Revoke'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Documents */}
                    {p && (
                      <div className="px-6 pb-5">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>Documents</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { label: 'Business registration', url: p.businessRegPhotoUrl },
                            { label: 'Address proof', url: p.addressProofPhotoUrl },
                          ].map((doc) => (
                            <div key={doc.label} className="rounded-xl border overflow-hidden"
                              style={{
                                borderColor: doc.url && isPending ? '#FCD34D' : 'var(--border)',
                                borderWidth: doc.url && isPending ? 2 : 1,
                              }}>
                              {doc.url ? (
                                <button
                                  onClick={() => setExpandedPhoto(expandedPhoto === doc.url ? null : doc.url!)}
                                  className="w-full h-28 flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80 overflow-hidden"
                                  style={{ background: '#F8FAFC', color: '#1E3A8A' }}>
                                  {expandedPhoto === doc.url ? (
                                    <img src={doc.url} alt={doc.label} className="w-full h-28 object-cover" />
                                  ) : (
                                    <span>📄 View photo</span>
                                  )}
                                </button>
                              ) : (
                                <div className="w-full h-28 flex items-center justify-center" style={{ background: '#F8FAFC' }}>
                                  <span className="text-xs" style={{ color: '#CBD5E1' }}>Not uploaded</span>
                                </div>
                              )}
                              <div className="px-3 py-2.5 flex items-center justify-between gap-2" style={{ background: 'white' }}>
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
                                {doc.url && !p.isVerified && (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                    style={{ background: '#FFFBEB', color: '#D97706' }}>
                                    Awaiting review
                                  </span>
                                )}
                                {doc.url && p.isVerified && (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                    style={{ background: '#DCFCE7', color: '#16A34A' }}>
                                    ✓ Verified
                                  </span>
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
