'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import api from '@/lib/api';

const businessNav = [
  { href: '/business', label: 'Dashboard', icon: '🏠' },
  { href: '/business/post-job', label: 'Post a job', icon: '➕' },
  { href: '/business/jobs', label: 'My jobs', icon: '📦' },
  { href: '/business/analytics', label: 'Analytics', icon: '📊' },
  { href: '/business/account', label: 'Account', icon: '👤' },
];

const driverNav = [
  { href: '/driver', label: 'Dashboard', icon: '🏠' },
  { href: '/driver/jobs', label: 'Available jobs', icon: '🔍' },
  { href: '/driver/my-jobs', label: 'My jobs', icon: '📦' },
  { href: '/driver/earnings', label: 'Earnings', icon: '💷' },
  { href: '/driver/profile', label: 'Profile', icon: '👤' },
];

const adminNav = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/jobs', label: 'All jobs', icon: '📦' },
  { href: '/admin/drivers', label: 'Drivers', icon: '🚐' },
  { href: '/admin/businesses', label: 'Businesses', icon: '🏪' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = () =>
      api.get('/api/notifications/unread-count')
        .then((r) => setUnread(r.data?.count ?? 0))
        .catch(() => {});
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const nav = user.role === 'BUSINESS' ? businessNav : user.role === 'DRIVER' ? driverNav : adminNav;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col border-r bg-white transition-all duration-200"
        style={{ width: collapsed ? 64 : 240, borderColor: 'var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--primary)' }}>
                elmi<span style={{ color: 'var(--accent)' }}>.</span>
              </span>
              <p className="text-xs font-semibold truncate mt-2" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: user.role === 'DRIVER' ? '#FFF7ED' : '#EFF6FF', color: user.role === 'DRIVER' ? 'var(--accent)' : 'var(--primary)' }}>
                {user.role}
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-sm font-bold ml-auto"
            style={{ color: 'var(--text-secondary)' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium w-full transition-colors"
                style={{
                  background: active ? 'rgba(30,58,138,0.08)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Notifications + Sign out */}
        <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => { router.push('/notifications'); }}
            title={collapsed ? 'Notifications' : undefined}
            className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium w-full transition-colors mb-1 hover:bg-gray-100"
            style={{
              color: pathname === '/notifications' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: pathname === '/notifications' ? 700 : 500,
              background: pathname === '/notifications' ? 'rgba(30,58,138,0.08)' : 'transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
            <span className="relative flex-shrink-0 text-base">
              🔔
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: '#EF4444', fontSize: 9, lineHeight: 1 }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            {!collapsed && (
              <span className="flex-1 text-left">
                Notifications
                {unread > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-white font-bold"
                    style={{ background: '#EF4444', fontSize: 10 }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
            )}
          </button>
          <button onClick={() => { logout(); router.replace('/'); }}
            title={collapsed ? 'Sign out' : undefined}
            className="flex items-center gap-2 text-sm font-semibold w-full px-2.5 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
            style={{ color: '#DC2626', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span className="text-base flex-shrink-0">🚪</span>
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto flex flex-col" style={{ background: 'var(--background)' }}>
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
