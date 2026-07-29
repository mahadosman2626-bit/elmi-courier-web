'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

interface MonthData { label: string; revenue: number; platformFee: number; jobs: number; }
interface DriverEntry {
  id: string; name: string;
  driverProfile: { totalEarnings: number; totalJobs: number; averageRating: number | null; vanType: string | null } | null;
}
interface BusinessEntry {
  id: string; name: string;
  businessProfile: { businessName: string | null; totalSpend: number; totalJobs: number; averageRating: number | null } | null;
}
interface Analytics {
  monthly: MonthData[];
  topDrivers: DriverEntry[];
  topBusinesses: BusinessEntry[];
  vanSizes: Record<string, number>;
  urgencies: Record<string, number>;
  totalPlatformFee: number;
  totalDriverEarnings: number;
  totalRevenue: number;
  avgJobValue: number;
  totalDelivered: number;
}

const MEDAL = ['🥇', '🥈', '🥉'];

function BarChart({ data, valueKey, color, formatValue }: {
  data: MonthData[];
  valueKey: 'revenue' | 'jobs' | 'platformFee';
  color: string;
  formatValue: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height: 120 }}>
      {data.map((d, i) => {
        const val = d[valueKey];
        const h = Math.max((val / max) * 100, val > 0 ? 3 : 0);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span style={{ fontSize: 9, color, fontWeight: 700, minHeight: 13, display: 'block', textAlign: 'center' }}>
              {val > 0 ? formatValue(val) : ''}
            </span>
            <div className="w-full rounded-t-md" style={{ height: `${h}%`, background: color, minHeight: val > 0 ? 3 : 0 }} />
            <span style={{ fontSize: 9, color: '#94A3B8' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownBar({ items, total, color }: { items: [string, number][]; total: number; color: string }) {
  return (
    <div className="flex flex-col gap-2">
      {items.sort((a, b) => b[1] - a[1]).map(([label, count]) => (
        <div key={label}>
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>{count} ({total > 0 ? Math.round(count / total * 100) : 0}%)</span>
          </div>
          <div className="w-full rounded-full" style={{ height: 6, background: '#F1F5F9' }}>
            <div className="rounded-full" style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, height: 6, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/analytics')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const fmtMoney = (v: number) => v >= 1000 ? `£${(v / 1000).toFixed(1)}k` : `£${v.toFixed(0)}`;
  const completionPct = data && data.totalDelivered > 0 && data.totalRevenue > 0 ? 100 : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        {/* Dark header */}
        <div className="px-8 py-10" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.push('/admin')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>
              ← Dashboard
            </button>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Admin</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Analytics</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>Platform performance — all time</p>

          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Total revenue', value: `£${data.totalRevenue.toFixed(2)}`, sub: 'from all delivered jobs', color: '#34D399' },
                { label: 'Platform cut', value: `£${data.totalPlatformFee.toFixed(2)}`, sub: '12% of each delivery', color: '#60A5FA' },
                { label: 'Avg job value', value: `£${data.avgJobValue.toFixed(2)}`, sub: 'per delivered job', color: '#FCD34D' },
                { label: 'Jobs delivered', value: data.totalDelivered.toString(), sub: `£${data.totalDriverEarnings.toFixed(0)} to drivers`, color: '#F87171' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs font-bold text-white mt-0.5">{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-8">
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading analytics…</p>
          ) : !data ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Failed to load analytics.</p>
          ) : (
            <>
              {/* Revenue + Volume charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Revenue</p>
                  <p className="text-sm font-extrabold mb-4" style={{ color: '#0F172A' }}>Monthly (last 12 months)</p>
                  <BarChart data={data.monthly} valueKey="revenue" color="#1E3A8A"
                    formatValue={(v) => v >= 1000 ? `£${(v / 1000).toFixed(1)}k` : `£${v.toFixed(0)}`} />
                </div>
                <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Volume</p>
                  <p className="text-sm font-extrabold mb-4" style={{ color: '#0F172A' }}>Jobs delivered per month</p>
                  <BarChart data={data.monthly} valueKey="jobs" color="#F97316"
                    formatValue={(v) => v.toString()} />
                </div>
              </div>

              {/* Platform fee chart */}
              <div className="bg-white rounded-2xl p-6 border mb-8" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Platform revenue</p>
                <p className="text-sm font-extrabold mb-4" style={{ color: '#0F172A' }}>Monthly Elmi fee (12%) earned</p>
                <BarChart data={data.monthly} valueKey="platformFee" color="#8B5CF6"
                  formatValue={(v) => v >= 1000 ? `£${(v / 1000).toFixed(1)}k` : `£${v.toFixed(0)}`} />
              </div>

              {/* Top drivers + businesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* Top drivers */}
                <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Leaderboard</p>
                    <h2 className="text-sm font-extrabold">Top Drivers</h2>
                  </div>
                  {data.topDrivers.length === 0 ? (
                    <p className="p-5 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>No driver data yet</p>
                  ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {data.topDrivers.map((d, i) => (
                        <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                          <span style={{ fontSize: i < 3 ? 18 : 13, width: 24, textAlign: 'center', color: i < 3 ? undefined : '#94A3B8', fontWeight: 700 }}>
                            {i < 3 ? MEDAL[i] : `#${i + 1}`}
                          </span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: '#1E3A8A' }}>
                            {d.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{d.name}</p>
                            <p className="text-xs" style={{ color: '#94A3B8' }}>
                              {d.driverProfile?.totalJobs ?? 0} jobs
                              {d.driverProfile?.averageRating ? ` · ⭐ ${d.driverProfile.averageRating.toFixed(1)}` : ''}
                              {d.driverProfile?.vanType ? ` · ${d.driverProfile.vanType}` : ''}
                            </p>
                          </div>
                          <p className="text-sm font-extrabold" style={{ color: '#16A34A' }}>
                            £{(d.driverProfile?.totalEarnings ?? 0).toFixed(0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top businesses */}
                <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Leaderboard</p>
                    <h2 className="text-sm font-extrabold">Top Businesses</h2>
                  </div>
                  {data.topBusinesses.length === 0 ? (
                    <p className="p-5 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>No business data yet</p>
                  ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {data.topBusinesses.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                          <span style={{ fontSize: i < 3 ? 18 : 13, width: 24, textAlign: 'center', color: i < 3 ? undefined : '#94A3B8', fontWeight: 700 }}>
                            {i < 3 ? MEDAL[i] : `#${i + 1}`}
                          </span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: '#7C3AED' }}>
                            {(b.businessProfile?.businessName || b.name).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>
                              {b.businessProfile?.businessName || b.name}
                            </p>
                            <p className="text-xs" style={{ color: '#94A3B8' }}>
                              {b.businessProfile?.totalJobs ?? 0} jobs
                              {b.businessProfile?.averageRating ? ` · ⭐ ${b.businessProfile.averageRating.toFixed(1)}` : ''}
                            </p>
                          </div>
                          <p className="text-sm font-extrabold" style={{ color: '#1E3A8A' }}>
                            £{(b.businessProfile?.totalSpend ?? 0).toFixed(0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Breakdown charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Breakdown</p>
                  <h2 className="text-sm font-extrabold mb-5" style={{ color: '#0F172A' }}>Jobs by van size</h2>
                  <BreakdownBar
                    items={Object.entries(data.vanSizes)}
                    total={Object.values(data.vanSizes).reduce((s, v) => s + v, 0)}
                    color="#1E3A8A"
                  />
                  {Object.keys(data.vanSizes).length === 0 && (
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Breakdown</p>
                  <h2 className="text-sm font-extrabold mb-5" style={{ color: '#0F172A' }}>Jobs by urgency</h2>
                  <BreakdownBar
                    items={Object.entries(data.urgencies)}
                    total={Object.values(data.urgencies).reduce((s, v) => s + v, 0)}
                    color="#F97316"
                  />
                  {Object.keys(data.urgencies).length === 0 && (
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
                  )}
                </div>
              </div>

              {/* Revenue split */}
              <div className="bg-white rounded-2xl p-6 border mb-8" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94A3B8' }}>Revenue split</p>
                <h2 className="text-sm font-extrabold mb-5" style={{ color: '#0F172A' }}>All-time platform vs. driver earnings</h2>
                <div className="flex gap-3 mb-4">
                  {data.totalRevenue > 0 && (
                    <>
                      <div
                        className="rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          width: `${(data.totalPlatformFee / data.totalRevenue) * 100}%`,
                          minWidth: 40, height: 36, background: '#8B5CF6',
                        }}
                      >
                        {Math.round((data.totalPlatformFee / data.totalRevenue) * 100)}%
                      </div>
                      <div
                        className="rounded-xl flex items-center justify-center text-white text-xs font-bold flex-1"
                        style={{ height: 36, background: '#16A34A' }}
                      >
                        {Math.round((data.totalDriverEarnings / data.totalRevenue) * 100)}%
                      </div>
                    </>
                  )}
                  {data.totalRevenue === 0 && (
                    <div className="w-full rounded-xl" style={{ height: 36, background: '#F1F5F9' }} />
                  )}
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#8B5CF6' }} />
                    <span className="text-xs font-medium" style={{ color: '#0F172A' }}>
                      Elmi fee — £{data.totalPlatformFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#16A34A' }} />
                    <span className="text-xs font-medium" style={{ color: '#0F172A' }}>
                      Driver earnings — £{data.totalDriverEarnings.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
