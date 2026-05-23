'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchDrivers = () => api.get('/api/admin/drivers').then((r) => { setDrivers(r.data); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { fetchDrivers(); }, []);

  const updateDriver = async (userId: string, data: Record<string, boolean>) => {
    setUpdating(userId);
    try {
      await api.patch(`/api/admin/drivers/${userId}/verify`, data);
      fetchDrivers();
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'ALL' ? drivers
    : filter === 'PENDING' ? drivers.filter((d) => d.driverProfile?.documentsSubmittedAt && !d.driverProfile?.isApproved)
    : filter === 'APPROVED' ? drivers.filter((d) => d.driverProfile?.isApproved)
    : drivers.filter((d) => !d.driverProfile?.isApproved && !d.driverProfile?.documentsSubmittedAt);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">Drivers</h1>

        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'APPROVED', 'NEW'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--background)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                border: '1.5px solid',
                borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              }}>
              {f === 'ALL' ? `All (${drivers.length})` : f === 'PENDING' ? 'Pending review' : f === 'APPROVED' ? 'Approved' : 'No docs'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: 'var(--border)' }}>
            <p className="font-semibold">No drivers found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((driver) => {
              const p = driver.driverProfile;
              const isApproved = p?.isApproved;
              return (
                <div key={driver.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: 'var(--primary)' }}>
                        {driver.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold">{driver.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{driver.email} · {driver.phone}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Joined {new Date(driver.createdAt).toLocaleDateString('en-GB')}
                          {p?.totalJobs > 0 && ` · ${p.totalJobs} jobs`}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: isApproved ? '#F0FDF4' : p?.documentsSubmittedAt ? '#FFFBEB' : '#F1F5F9',
                        color: isApproved ? '#16A34A' : p?.documentsSubmittedAt ? '#D97706' : '#64748B',
                      }}>
                      {isApproved ? 'Approved' : p?.documentsSubmittedAt ? 'Pending review' : 'No docs'}
                    </span>
                  </div>

                  {p && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Driving licence', key: 'licenceVerified', url: p.licencePhotoUrl },
                        { label: 'Insurance', key: 'insuranceVerified', url: p.insurancePhotoUrl },
                        { label: 'GIT certificate', key: 'gitVerified', url: p.gitPhotoUrl },
                      ].map((doc) => (
                        <div key={doc.key} className="rounded-xl p-3 border text-center"
                          style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{doc.label}</p>
                          {doc.url ? (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-bold underline block mb-2" style={{ color: 'var(--primary)' }}>
                              View doc
                            </a>
                          ) : (
                            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Not uploaded</p>
                          )}
                          <div className="flex gap-1.5 justify-center">
                            <button onClick={() => updateDriver(driver.id, { [doc.key]: true })}
                              disabled={updating === driver.id || p[doc.key]}
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{
                                background: p[doc.key] ? '#F0FDF4' : 'var(--background)',
                                color: p[doc.key] ? '#16A34A' : 'var(--text-secondary)',
                                border: '1px solid',
                                borderColor: p[doc.key] ? '#16A34A' : 'var(--border)',
                              }}>
                              {p[doc.key] ? '✓ OK' : 'Verify'}
                            </button>
                            {p[doc.key] && (
                              <button onClick={() => updateDriver(driver.id, { [doc.key]: false })}
                                disabled={updating === driver.id}
                                className="px-2 py-1 rounded text-xs font-bold border"
                                style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isApproved && (
                      <button onClick={() => updateDriver(driver.id, { isApproved: true, licenceVerified: true, insuranceVerified: true, gitVerified: true })}
                        disabled={updating === driver.id}
                        className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50"
                        style={{ background: '#16A34A' }}>
                        Approve driver
                      </button>
                    )}
                    {isApproved && (
                      <button onClick={() => updateDriver(driver.id, { isApproved: false })}
                        disabled={updating === driver.id}
                        className="px-4 py-2 rounded-xl text-xs font-bold border disabled:opacity-50"
                        style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                        Revoke approval
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
