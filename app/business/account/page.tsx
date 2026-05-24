'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

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

export default function BusinessAccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ totalJobs: 0, totalSpent: 0 });
  const [profile, setProfile] = useState<any>(null);

  // Edit profile modal
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);

  // Change password modal
  const [changingPw, setChangingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  // Notifications toggle
  const [emailNotifs, setEmailNotifs] = useState(true);

  useEffect(() => {
    api.get('/api/auth/me').then((res) => {
      const d = res.data;
      setProfile(d);
      setEditName(d.name || '');
      setEditPhone(d.phone || '');
      setEditAddress(d.address || '');
    });
    api.get('/api/business/jobs').then((res) => {
      const jobs = Array.isArray(res.data) ? res.data : res.data.jobs ?? [];
      const totalSpent = jobs.reduce((sum: number, j: any) => sum + (j.price || 0), 0);
      setStats({ totalJobs: jobs.length, totalSpent });
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/api/auth/profile', { name: editName, phone: editPhone, address: editAddress });
      setProfile((p: any) => ({ ...p, name: editName, phone: editPhone, address: editAddress }));
      setEditing(false);
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

        {/* Dark header */}
        <div className="px-8 pt-10 pb-8 flex flex-col items-center" style={{ background: '#0F172A' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold border-2 mb-4"
            style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            {initials}
          </div>
          <p className="text-white font-extrabold text-xl tracking-tight">{user?.name}</p>
          <p className="text-sm mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>{user?.email}</p>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(30,58,138,0.4)', color: '#93C5FD' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#93C5FD' }} />
            Business account
          </div>
        </div>

        <div className="px-6 py-6 max-w-xl mx-auto flex flex-col gap-6">

          {/* Stats row */}
          <div className="bg-white rounded-2xl flex divide-x shadow-sm" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Jobs Posted', value: stats.totalJobs },
              { label: 'Total Spent', value: `£${stats.totalSpent.toFixed(0)}` },
            ].map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-5">
                <p className="text-xl font-extrabold" style={{ color: '#0F172A' }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Business Details */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Business Details</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <MenuItem iconColor="#3B82F6" icon="🏪" label="Company name" value={profile?.name || user?.name || '—'} onClick={() => setEditing(true)} />
              <MenuItem iconColor="#6366F1" icon="📧" label="Email address" value={user?.email || '—'} onClick={() => setEditing(true)} />
              <MenuItem iconColor="#8B5CF6" icon="📞" label="Phone number" value={profile?.phone || 'Not set'} onClick={() => setEditing(true)} />
              <MenuItem iconColor="#14B8A6" icon="📍" label="Address" value={profile?.address || 'Not set'} onClick={() => setEditing(true)} last />
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Activity</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <MenuItem iconColor="#F97316" icon="📦" label="Job history" onClick={() => router.push('/business/jobs')} />
              <MenuItem iconColor="#10B981" icon="✅" label="Account verification" value="Verified" last />
            </div>
          </div>

          {/* Billing */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Billing</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <MenuItem iconColor="#F59E0B" icon="💳" label="Payment methods" value="Coming soon" onClick={() => {}} last />
            </div>
          </div>

          {/* Notifications */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Notifications</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3.5 px-4 py-3.5">
                <IconBox color="#6366F1">🔔</IconBox>
                <span className="flex-1 text-sm font-medium" style={{ color: '#0F172A' }}>Email notifications</span>
                <button
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                  style={{ background: emailNotifs ? '#1E3A8A' : '#CBD5E1' }}>
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    style={{ transform: emailNotifs ? 'translateX(20px)' : 'translateX(0)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#64748B' }}>Account</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <MenuItem iconColor="#3B82F6" icon="✏️" label="Edit profile" onClick={() => setEditing(true)} />
              <MenuItem iconColor="#64748B" icon="🔒" label="Change password" onClick={() => setChangingPw(true)} />
              <MenuItem iconColor="#F97316" icon="📄" label="Terms of Service" onClick={() => router.push('/terms')} />
              <MenuItem iconColor="#1E3A8A" icon="🛡️" label="Privacy Policy" onClick={() => router.push('/privacy')} />
              <MenuItem iconColor="#10B981" icon="💬" label="Support" onClick={() => window.location.href = 'mailto:support@elmicourier.co.uk'} last />
            </div>
          </div>

          {/* Sign out */}
          <button onClick={() => { logout(); router.replace('/'); }}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2"
            style={{ borderColor: '#DC2626', color: '#DC2626' }}>
            🚪 Sign out
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
                { label: 'Company name', value: editName, set: setEditName, placeholder: 'Your company name' },
                { label: 'Phone number', value: editPhone, set: setEditPhone, placeholder: '+44 7700 000000' },
                { label: 'Address', value: editAddress, set: setEditAddress, placeholder: '123 High Street, London' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>{f.label}</label>
                  <input value={f.value} onChange={(e) => f.set(e.target.value)}
                    className={inputClass} style={inputStyle} placeholder={f.placeholder} />
                </div>
              ))}
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
