'use client';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLast6Months() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] };
  });
}

function BarChart({ bars, valuePrefix = '', valueSuffix = '', color = '#1E3A8A' }: {
  bars: { label: string; value: number }[];
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
}) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div className="flex items-end gap-3 h-40 pt-2">
      {bars.map((b) => {
        const pct = (b.value / max) * 100;
        return (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-bold" style={{ color: b.value > 0 ? '#0F172A' : '#CBD5E1' }}>
              {b.value > 0 ? `${valuePrefix}${b.value % 1 === 0 ? b.value : b.value.toFixed(0)}${valueSuffix}` : ''}
            </span>
            <div className="w-full rounded-t-lg transition-all" style={{
              height: `${Math.max(pct, b.value > 0 ? 6 : 2)}%`,
              background: b.value > 0 ? color : '#E2E8F0',
              minHeight: 4,
            }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub, color = '#1E3A8A' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
      <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold mt-1" style={{ color: '#0F172A' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{sub}</p>}
    </div>
  );
}

export default function BusinessAnalyticsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/jobs/my')
      .then((r) => setJobs(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  }, []);

  const months = useMemo(() => getLast6Months(), []);

  const stats = useMemo(() => {
    const delivered = jobs.filter((j) => j.status === 'DELIVERED');
    const cancelled = jobs.filter((j) => j.status === 'CANCELLED');
    const totalSpend = delivered.reduce((s, j) => s + (j.totalPrice ?? 0), 0);
    const avgJobValue = delivered.length > 0 ? totalSpend / delivered.length : 0;

    // Monthly spend (delivered jobs)
    const monthlySpend = months.map(({ year, month, label }) => {
      const val = delivered
        .filter((j) => {
          const d = new Date(j.createdAt);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((s, j) => s + (j.totalPrice ?? 0), 0);
      return { label, value: Math.round(val) };
    });

    // Monthly job count (all jobs)
    const monthlyJobs = months.map(({ year, month, label }) => {
      const val = jobs.filter((j) => {
        const d = new Date(j.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
      return { label, value: val };
    });

    // Status breakdown
    const statuses = ['DELIVERED', 'CANCELLED', 'POSTED', 'ACCEPTED', 'IN_TRANSIT', 'COLLECTING'];
    const statusCounts = statuses.map((s) => ({ label: s.replace('_', ' '), value: jobs.filter((j) => j.status === s).length }));

    // Top drivers
    const driverMap: Record<string, { name: string; jobs: number; spend: number }> = {};
    delivered.forEach((j) => {
      if (!j.driver) return;
      const id = j.driver.id;
      if (!driverMap[id]) driverMap[id] = { name: j.driver.name, jobs: 0, spend: 0 };
      driverMap[id].jobs += 1;
      driverMap[id].spend += j.driverEarnings ?? 0;
    });
    const topDrivers = Object.values(driverMap).sort((a, b) => b.jobs - a.jobs).slice(0, 5);

    // Van size breakdown
    const vanMap: Record<string, number> = {};
    jobs.forEach((j) => { vanMap[j.vanSize] = (vanMap[j.vanSize] ?? 0) + 1; });
    const vanBreakdown = Object.entries(vanMap).sort((a, b) => b[1] - a[1]);

    return { delivered, cancelled, totalSpend, avgJobValue, monthlySpend, monthlyJobs, statusCounts, topDrivers, vanBreakdown };
  }, [jobs, months]);

  return (
    <DashboardLayout>
      <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ background: '#0F172A' }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Business</p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics</h1>
          </div>
        </div>

        <div className="px-6 py-6 max-w-4xl mx-auto flex flex-col gap-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mb-3"
                style={{ borderColor: '#1E3A8A', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#94A3B8' }}>Loading…</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total spent" value={`£${stats.totalSpend.toFixed(0)}`} sub="all time" color="#1E3A8A" />
                <StatCard label="Jobs delivered" value={String(stats.delivered.length)} sub="completed" color="#16A34A" />
                <StatCard label="Avg. job value" value={stats.avgJobValue > 0 ? `£${stats.avgJobValue.toFixed(0)}` : '—'} sub="per delivery" color="#F97316" />
                <StatCard label="Cancelled" value={String(stats.cancelled.length)} sub={`of ${jobs.length} total`} color="#EF4444" />
              </div>

              {/* Monthly spend chart */}
              <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Monthly Spend (£)</p>
                <BarChart bars={stats.monthlySpend} valuePrefix="£" color="#1E3A8A" />
              </div>

              {/* Monthly jobs chart */}
              <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Jobs Per Month</p>
                <BarChart bars={stats.monthlyJobs} color="#F97316" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Status breakdown */}
                <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Job Status Breakdown</p>
                  {jobs.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: '#94A3B8' }}>No jobs yet</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {stats.statusCounts.filter((s) => s.value > 0).map((s) => {
                        const pct = Math.round((s.value / jobs.length) * 100);
                        const colors: Record<string, string> = {
                          'DELIVERED': '#16A34A', 'CANCELLED': '#EF4444',
                          'IN TRANSIT': '#6366F1', 'COLLECTING': '#F97316',
                          'ACCEPTED': '#1E3A8A', 'POSTED': '#94A3B8',
                        };
                        const c = colors[s.label] ?? '#94A3B8';
                        return (
                          <div key={s.label}>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span style={{ color: '#0F172A' }}>{s.label}</span>
                              <span style={{ color: '#64748B' }}>{s.value} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full" style={{ background: '#F1F5F9' }}>
                              <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: c }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Van size breakdown */}
                <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Van Sizes Used</p>
                  {stats.vanBreakdown.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: '#94A3B8' }}>No jobs yet</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {stats.vanBreakdown.map(([van, count]) => {
                        const pct = Math.round((count / jobs.length) * 100);
                        return (
                          <div key={van}>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span style={{ color: '#0F172A' }}>🚐 {van}</span>
                              <span style={{ color: '#64748B' }}>{count} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full" style={{ background: '#F1F5F9' }}>
                              <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: '#1E3A8A' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Top drivers */}
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: '#E2E8F0' }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Top Drivers</p>
                </div>
                {stats.topDrivers.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: '#94A3B8' }}>No completed deliveries yet</p>
                ) : (
                  <div>
                    {stats.topDrivers.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0"
                        style={{ borderColor: '#F1F5F9' }}>
                        <span className="text-sm font-extrabold w-5 text-center" style={{ color: i === 0 ? '#F97316' : '#94A3B8' }}>
                          {i + 1}
                        </span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: '#1E3A8A' }}>
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{d.name}</p>
                          <p className="text-xs" style={{ color: '#64748B' }}>{d.jobs} job{d.jobs !== 1 ? 's' : ''}</p>
                        </div>
                        <p className="text-sm font-bold" style={{ color: '#16A34A' }}>£{d.spend.toFixed(0)} paid</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {jobs.length === 0 && (
                <div className="bg-white rounded-2xl p-14 text-center border" style={{ borderColor: '#E2E8F0' }}>
                  <p className="text-4xl mb-3">📊</p>
                  <p className="font-bold mb-1" style={{ color: '#0F172A' }}>No data yet</p>
                  <p className="text-sm" style={{ color: '#64748B' }}>Post your first job to start seeing analytics.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
