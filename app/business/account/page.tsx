'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function BusinessAccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight mb-8">Account</h1>

        <div className="bg-white rounded-2xl p-6 border mb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl"
              style={{ background: 'var(--primary)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-lg">{user?.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold inline-block"
            style={{ background: '#EFF6FF', color: '#1E3A8A' }}>
            Business account
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: 'var(--border)' }}>
          {[
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
          ].map((item, i) => (
            <button key={item.label} onClick={() => router.push(item.href)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium hover:bg-gray-50 transition-colors text-left"
              style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              {item.label}
              <span style={{ color: 'var(--text-secondary)' }}>→</span>
            </button>
          ))}
        </div>

        <button onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl text-sm font-bold border"
          style={{ borderColor: '#DC2626', color: '#DC2626' }}>
          Sign out
        </button>
      </div>
    </DashboardLayout>
  );
}
