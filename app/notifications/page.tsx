'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  JOB_POSTED:   { icon: '➕', color: '#1E3A8A', bg: '#EFF6FF' },
  JOB_ACCEPTED: { icon: '✅', color: '#10B981', bg: '#ECFDF5' },
  COLLECTING:   { icon: '📍', color: '#F97316', bg: '#FFF7ED' },
  IN_TRANSIT:   { icon: '🚚', color: '#6366F1', bg: '#EEF2FF' },
  DELIVERED:    { icon: '🏆', color: '#F59E0B', bg: '#FFFBEB' },
  CANCELLED:    { icon: '🚫', color: '#EF4444', bg: '#FEF2F2' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications')
      .then((r) => setNotifications(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Dark header */}
        <div className="px-8 pt-8 pb-6" style={{ background: '#0F172A' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Activity</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Notifications</h1>
            </div>
            {notifications.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                {notifications.length} total
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-6 max-w-2xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mb-3"
                style={{ borderColor: '#1E3A8A', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#94A3B8' }}>Loading…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border" style={{ borderColor: '#E2E8F0' }}>
              <p className="text-5xl mb-4">🔔</p>
              <p className="font-bold text-lg mb-2" style={{ color: '#0F172A' }}>No notifications yet</p>
              <p className="text-sm" style={{ color: '#64748B' }}>Activity from your jobs will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] || { icon: '🔔', color: '#1E3A8A', bg: '#EFF6FF' };
                const isLast = i === notifications.length - 1;
                return (
                  <div key={n.id} className="flex gap-4">
                    {/* Timeline column */}
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
                      <div className="w-0.5 flex-1" style={{ background: i === 0 ? 'transparent' : '#E2E8F0', minHeight: 12 }} />
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: cfg.bg }}>
                        {cfg.icon}
                      </div>
                      <div className="w-0.5 flex-1" style={{ background: isLast ? 'transparent' : '#E2E8F0', minHeight: 12 }} />
                    </div>

                    {/* Card */}
                    <div className={`flex-1 bg-white rounded-2xl p-4 mb-3 border ${n.jobId ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}`}
                      style={{
                        borderColor: !n.read ? cfg.color + '40' : '#E2E8F0',
                        borderLeftWidth: !n.read ? 3 : 1,
                        borderLeftColor: !n.read ? cfg.color : '#E2E8F0',
                      }}
                      onClick={() => {
                        if (!n.jobId) return;
                        if (n.type === 'JOB_POSTED') router.push(`/driver/jobs`);
                        else router.push(`/business/jobs/${n.jobId}`);
                      }}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold leading-snug" style={{ color: '#0F172A' }}>{n.title}</p>
                        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#94A3B8' }}>{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#64748B' }}>{n.body}</p>
                      <p className="text-xs mt-2" style={{ color: '#CBD5E1' }}>
                        {new Date(n.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
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
