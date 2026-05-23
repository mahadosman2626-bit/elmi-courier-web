'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBusinesses = () => api.get('/api/admin/businesses').then((r) => { setBusinesses(r.data); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { fetchBusinesses(); }, []);

  const updateBusiness = async (userId: string, isVerified: boolean) => {
    setUpdating(userId);
    try {
      await api.patch(`/api/admin/businesses/${userId}/verify`, { isVerified });
      fetchBusinesses();
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'ALL' ? businesses
    : filter === 'PENDING' ? businesses.filter((b) => b.businessProfile?.documentsSubmittedAt && !b.businessProfile?.isVerified)
    : filter === 'VERIFIED' ? businesses.filter((b) => b.businessProfile?.isVerified)
    : businesses;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">Businesses</h1>

        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'VERIFIED'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--background)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                border: '1.5px solid',
                borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              }}>
              {f === 'ALL' ? `All (${businesses.length})` : f === 'PENDING' ? 'Pending review' : 'Verified'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: 'var(--border)' }}>
            <p className="font-semibold">No businesses found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Business</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Jobs</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const p = b.businessProfile;
                  const isVerified = p?.isVerified;
                  return (
                    <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      <td className="px-4 py-3">
                        <p className="font-bold">{p?.businessName || b.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{b.name}</p>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        <p>{b.email}</p>
                        <p className="text-xs">{b.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold">{p?.totalJobs || 0}</span>
                        {p?.averageRating > 0 && (
                          <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>⭐ {p.averageRating.toFixed(1)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: isVerified ? '#F0FDF4' : p?.documentsSubmittedAt ? '#FFFBEB' : '#F1F5F9',
                            color: isVerified ? '#16A34A' : p?.documentsSubmittedAt ? '#D97706' : '#64748B',
                          }}>
                          {isVerified ? 'Verified' : p?.documentsSubmittedAt ? 'Pending' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(b.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        {!isVerified ? (
                          <button onClick={() => updateBusiness(b.id, true)} disabled={updating === b.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                            style={{ background: '#16A34A' }}>
                            {updating === b.id ? '…' : 'Verify'}
                          </button>
                        ) : (
                          <button onClick={() => updateBusiness(b.id, false)} disabled={updating === b.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-50"
                            style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                            {updating === b.id ? '…' : 'Revoke'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
