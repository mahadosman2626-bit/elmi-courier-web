'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

interface Review {
  id: string; score: number; comment: string | null; createdAt: string;
  rater: { name: string; businessProfile: { businessName: string } | null };
  job: { pickupAddress: string; dropoffAddress: string } | null;
}

function IconBox({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
      style={{ background: color }}>
      {children}
    </div>
  );
}

function MenuItem({ iconColor, icon, label, value, onClick, last = false }: {
  iconColor: string; icon: string; label: string; value?: string; onClick?: () => void; last?: boolean;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <IconBox color={iconColor}>{icon}</IconBox>
      <span className="flex-1 text-sm font-medium" style={{ color: '#0F172A' }}>{label}</span>
      {value
        ? <span className="text-xs font-medium" style={{ color: '#64748B' }}>{value}</span>
        : <span className="text-xs" style={{ color: '#94A3B8' }}>›</span>}
    </button>
  );
}

function DocItem({ iconColor, icon, label, verified, submitted, last = false, onClick }: {
  iconColor: string; icon: string; label: string; verified: boolean; submitted: boolean; last?: boolean; onClick?: () => void;
}) {
  const statusLabel = verified ? 'Verified' : submitted ? 'Pending' : 'Upload';
  const statusColor = verified ? '#16A34A' : submitted ? '#F59E0B' : '#1E3A8A';
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <IconBox color={verified ? iconColor : iconColor + '60'}>{icon}</IconBox>
      <span className="flex-1 text-sm font-medium" style={{ color: '#0F172A' }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: statusColor }}>{statusLabel}</span>
    </button>
  );
}

export default function DriverProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [, setLoading] = useState(true);

  // Edit profile modal state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editVanType, setEditVanType] = useState('');
  const [editVanReg, setEditVanReg] = useState('');
  const [editVanYear, setEditVanYear] = useState('');
  const [saving, setSaving] = useState(false);

  // Change password state
  const [changingPw, setChangingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/auth/me'),
      api.get('/api/driver/earnings'),
      api.get('/api/driver/reviews').catch(() => ({ data: [] })),
    ]).then(([meRes, earningsRes, reviewsRes]) => {
      const p = meRes.data.driverProfile;
      setProfile(p);
      setEarnings(earningsRes.data);
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      setEditName(meRes.data.name || '');
      setEditPhone(meRes.data.phone || '');
      setEditVanType(p?.vanType || '');
      setEditVanReg(p?.vanRegistration || '');
      setEditVanYear(p?.vanYear || '');
    }).finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.patch('/api/auth/profile', { name: editName, phone: editPhone }),
        api.patch('/api/driver/profile', { vanType: editVanType, vanRegistration: editVanReg, vanYear: editVanYear }),
      ]);
      setEditing(false);
      const meRes = await api.get('/api/auth/me');
      setProfile(meRes.data.driverProfile);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    setSavingPw(true);
    setPwMsg('');
    try {
      await api.patch('/api/auth/password', { currentPassword: currentPw, newPassword: newPw });
      setPwMsg('Password changed successfully.');
      setCurrentPw('');
      setNewPw('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setPwMsg(e?.response?.data?.error || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const inputClass = 'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2';
  const inputStyle = { borderColor: 'var(--border)', background: 'var(--background)' };

  return (
    <DashboardLayout>
      <div style={{ background: '#FAFAF7', minHeight: '100vh' }}>

        {/* Dark header — matches mobile */}
        <div className="px-8 pt-10 pb-8 flex flex-col items-center" style={{ background: '#0F172A' }}>
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold border-2"
              style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              {profile?.profilePhotoUrl
                ? <img src={profile.profilePhotoUrl} className="w-20 h-20 rounded-full object-cover" alt="" />
                : initials}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2"
              style={{ background: '#1E3A8A', borderColor: '#0F172A', fontSize: 11, color: '#fff' }}>
              📷
            </div>
          </div>

          <p className="text-white font-extrabold text-xl tracking-tight">{user?.name}</p>
          <p className="text-sm mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>{user?.email}</p>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-2.5 text-sm"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
            ⭐ {profile?.averageRating?.toFixed(1) ?? '—'} · {profile?.totalJobs ?? 0} jobs
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: profile?.isApproved ? 'rgba(22,163,74,0.2)' : 'rgba(245,158,11,0.2)',
              color: profile?.isApproved ? '#4ADE80' : '#FCD34D',
            }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: profile?.isApproved ? '#4ADE80' : '#FCD34D' }} />
            {profile?.isApproved ? 'Verified Driver' : 'Pending Approval'}
          </div>
        </div>

        <div className="px-6 py-6 max-w-xl mx-auto flex flex-col gap-6">

          {/* Stats row */}
          <div className="bg-white rounded-2xl flex divide-x shadow-sm" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Jobs Done', value: profile?.totalJobs ?? 0 },
              { label: 'Earned', value: `£${(earnings?.totalEarnings ?? 0).toFixed(0)}` },
              { label: 'Rating', value: profile?.averageRating?.toFixed(1) ?? '—' },
            ].map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-5">
                <p className="text-xl font-extrabold" style={{ color: '#0F172A' }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </p>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <p className="text-3xl mb-3">⭐</p>
                <p className="font-semibold text-sm" style={{ color: '#0F172A' }}>No reviews yet</p>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Reviews from businesses appear here after each delivery.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {reviews.map((r) => {
                  const biz = r.rater?.businessProfile?.businessName || r.rater?.name || 'Business';
                  return (
                    <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: '#1E3A8A' }}>
                            {biz.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{biz}</p>
                            <p className="text-xs" style={{ color: '#94A3B8' }}>
                              {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <span key={s} className="text-sm" style={{ opacity: s <= r.score ? 1 : 0.2 }}>⭐</span>
                          ))}
                        </div>
                      </div>
                      {r.job && (
                        <p className="text-xs mb-1.5" style={{ color: '#94A3B8' }}>
                          📦 {r.job.pickupAddress?.split(',')[0]} → {r.job.dropoffAddress?.split(',')[0]}
                        </p>
                      )}
                      {r.comment && (
                        <p className="text-sm px-3 py-2 rounded-xl" style={{ background: '#F8FAFC', color: '#0F172A' }}>
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Van Details */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Van Details</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <MenuItem iconColor="#3B82F6" icon="🚐" label="Van Type" value={profile?.vanType || '—'} onClick={() => setEditing(true)} />
              <MenuItem iconColor="#6366F1" icon="📋" label="Registration" value={profile?.vanRegistration || 'Not set'} onClick={() => setEditing(true)} />
              <MenuItem iconColor="#8B5CF6" icon="📅" label="Year" value={profile?.vanYear || 'Not set'} onClick={() => setEditing(true)} last />
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Documents</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <DocItem iconColor="#10B981" icon="💳" label="Driving Licence" verified={!!profile?.licenceVerified} submitted={!!profile?.licencePhotoUrl} />
              <DocItem iconColor="#14B8A6" icon="🛡️" label="H&R Insurance" verified={!!profile?.insuranceVerified} submitted={!!profile?.insurancePhotoUrl} />
              <DocItem iconColor="#F97316" icon="📦" label="Goods in Transit" verified={!!profile?.gitVerified} submitted={!!profile?.gitPhotoUrl} last />
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Account</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <MenuItem iconColor="#3B82F6" icon="✏️" label="Edit Profile" onClick={() => setEditing(true)} />
              <MenuItem iconColor="#64748B" icon="🔒" label="Change Password" onClick={() => setChangingPw(true)} />
              <MenuItem iconColor="#F97316" icon="📄" label="Terms of Service" onClick={() => router.push('/terms')} />
              <MenuItem iconColor="#1E3A8A" icon="🛡️" label="Privacy Policy" onClick={() => router.push('/privacy')} />
              <MenuItem iconColor="#10B981" icon="💬" label="Support" onClick={() => alert('Contact us at support@elmicourier.co.uk')} last />
            </div>
          </div>

          {/* Log Out */}
          <button onClick={() => { logout(); router.replace('/login'); }}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2"
            style={{ borderColor: '#DC2626', color: '#DC2626' }}>
            🚪 Log Out
          </button>

          <div className="h-4" />
        </div>
      </div>

      {/* Edit Profile modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="font-extrabold text-lg mb-5">Edit Profile</h2>
            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: 'Full name', value: editName, set: setEditName, placeholder: 'Your name' },
                { label: 'Phone', value: editPhone, set: setEditPhone, placeholder: '+44 7700 000000' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>{f.label}</label>
                  <input value={f.value} onChange={(e) => f.set(e.target.value)}
                    className={inputClass} style={inputStyle} placeholder={f.placeholder} />
                </div>
              ))}
              <p className="text-xs font-bold uppercase tracking-wide mt-2" style={{ color: '#64748B' }}>Van details</p>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>Van type</label>
                <select value={editVanType} onChange={(e) => setEditVanType(e.target.value)}
                  className={inputClass} style={inputStyle}>
                  <option value="">Select…</option>
                  {['Small Van', 'Medium Van', 'Large Van', 'Luton Van'].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>Registration plate</label>
                <input value={editVanReg} onChange={(e) => setEditVanReg(e.target.value.toUpperCase())}
                  className={inputClass} style={inputStyle} placeholder="AB12 CDE" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>Year</label>
                <input value={editVanYear} onChange={(e) => setEditVanYear(e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="2020" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)}
                className="flex-1 py-3 rounded-xl border font-bold text-sm"
                style={{ borderColor: 'var(--border)' }}>
                Cancel
              </button>
              <button onClick={saveProfile} disabled={saving}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                style={{ background: '#1E3A8A' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password modal */}
      {changingPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="font-extrabold text-lg mb-5">Change Password</h2>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>Current password</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>New password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="Min. 6 characters" />
              </div>
              {pwMsg && (
                <p className="text-xs font-medium px-3 py-2 rounded-lg"
                  style={{
                    background: pwMsg.includes('success') ? '#F0FDF4' : '#FEF2F2',
                    color: pwMsg.includes('success') ? '#16A34A' : '#DC2626',
                  }}>
                  {pwMsg}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setChangingPw(false); setPwMsg(''); }}
                className="flex-1 py-3 rounded-xl border font-bold text-sm"
                style={{ borderColor: 'var(--border)' }}>
                Cancel
              </button>
              <button onClick={savePassword} disabled={savingPw || !currentPw || !newPw}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                style={{ background: '#1E3A8A' }}>
                {savingPw ? 'Saving…' : 'Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
