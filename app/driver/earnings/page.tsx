'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

interface EarningsData {
  availableBalance: number;
  totalEarnings: number;
  totalJobs: number;
  weekEarnings: number;
  weekJobs: number;
  monthEarnings: number;
  monthJobs: number;
  recentJobs: { id: string; driverEarnings: number; pickupAddress: string; dropoffAddress: string; deliveredAt: string }[];
}
interface BankStatus { connected: boolean; payoutsEnabled: boolean; }

export default function DriverEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [bankStatus, setBankStatus] = useState<BankStatus>({ connected: false, payoutsEnabled: false });
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [connectingBank, setConnectingBank] = useState(false);

  const fetchAll = () =>
    Promise.all([
      api.get('/api/driver/earnings').then((r) => setData(r.data)),
      api.get('/api/payments/driver/onboard-status').then((r) => setBankStatus(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const handleConnectBank = async () => {
    setConnectingBank(true);
    try {
      const { data: res } = await api.post('/api/payments/driver/onboard');
      window.open(res.url, '_blank');
      setTimeout(() => {
        api.get('/api/payments/driver/onboard-status').then((r) => setBankStatus(r.data)).catch(() => {});
      }, 3000);
    } catch {
      alert('Could not start bank setup. Please try again.');
    } finally {
      setConnectingBank(false);
    }
  };

  const handleWithdraw = async () => {
    if (!bankStatus.connected || !bankStatus.payoutsEnabled) {
      alert('Connect your bank account first before withdrawing.');
      return;
    }
    if (!data?.availableBalance || data.availableBalance <= 0) {
      alert('No balance available to withdraw.');
      return;
    }
    if (!confirm(`Transfer £${data.availableBalance.toFixed(2)} to your bank account?`)) return;
    setWithdrawing(true);
    try {
      const { data: res } = await api.post('/api/payments/driver/withdraw');
      alert(res.message || 'Withdrawal initiated!');
      fetchAll();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const hasBalance = (data?.availableBalance ?? 0) > 0;
  const bankOk = bankStatus.connected && bankStatus.payoutsEnabled;

  return (
    <DashboardLayout>
      <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Dark header */}
        <div className="px-8 pt-8 pb-8 text-center" style={{ background: '#0F172A' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Total earned</p>
          <p className="text-5xl font-extrabold text-white tracking-tight mb-6">
            {loading ? '…' : `£${(data?.totalEarnings ?? 0).toFixed(2)}`}
          </p>
          <div className="inline-flex items-center gap-6 px-6 py-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            {[
              { label: 'This week', value: loading ? '…' : `£${(data?.weekEarnings ?? 0).toFixed(2)}` },
              { label: 'This month', value: loading ? '…' : `£${(data?.monthEarnings ?? 0).toFixed(2)}` },
              { label: 'Jobs this week', value: loading ? '…' : String(data?.weekJobs ?? 0) },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center">
                {i > 0 && <div className="w-px h-8 mx-6" style={{ background: 'rgba(255,255,255,0.15)' }} />}
                <div className="text-center">
                  <p className="text-lg font-extrabold text-white">{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 max-w-2xl mx-auto flex flex-col gap-4">

          {/* Bank account */}
          <div className="bg-white rounded-2xl p-5 border flex items-center gap-4"
            style={{ borderColor: bankOk ? 'rgba(16,185,129,0.3)' : '#E2E8F0' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: bankOk ? '#ECFDF5' : '#EFF6FF' }}>
              {bankOk ? '✅' : '🏦'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#0F172A' }}>
                {bankOk ? 'Bank account connected' : 'Connect bank account'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                {bankOk ? 'Payouts enabled — withdraw anytime' : 'Required to receive your earnings'}
              </p>
            </div>
            {!bankOk && (
              <button onClick={handleConnectBank} disabled={connectingBank}
                className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 flex-shrink-0"
                style={{ background: '#1E3A8A' }}>
                {connectingBank ? '…' : 'Set up'}
              </button>
            )}
          </div>

          {/* Available balance + withdraw */}
          <div className="bg-white rounded-2xl p-5 border flex items-center justify-between"
            style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: '#FFF7ED' }}>💰</div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>Available balance</p>
                <p className="text-2xl font-extrabold" style={{ color: '#0F172A' }}>
                  {loading ? '…' : `£${(data?.availableBalance ?? 0).toFixed(2)}`}
                </p>
              </div>
            </div>
            <button onClick={handleWithdraw} disabled={withdrawing || !hasBalance}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 flex-shrink-0"
              style={{ background: hasBalance ? '#F97316' : '#E2E8F0', color: hasBalance ? 'white' : '#94A3B8' }}>
              {withdrawing ? '…' : '↑ Withdraw'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total jobs', value: loading ? '…' : String(data?.totalJobs ?? 0), color: '#1E3A8A' },
              { label: 'Jobs this month', value: loading ? '…' : String(data?.monthJobs ?? 0), color: '#F97316' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Jobs this week */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Jobs This Week</p>
            {loading ? (
              <div className="bg-white rounded-2xl p-8 text-center border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Loading…</p>
              </div>
            ) : !data?.recentJobs?.length ? (
              <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-4xl mb-3">📋</p>
                <p className="font-bold mb-1" style={{ color: '#0F172A' }}>No jobs this week</p>
                <p className="text-sm" style={{ color: '#64748B' }}>Jobs you deliver will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {data.recentJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl p-4 border flex items-center gap-4"
                    style={{ borderColor: '#E2E8F0' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: '#ECFDF5' }}>✅</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>
                        {job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                        {job.deliveredAt
                          ? new Date(job.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-extrabold" style={{ color: '#16A34A' }}>+£{job.driverEarnings?.toFixed(2)}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold"
                        style={{ background: '#ECFDF5', color: '#16A34A' }}>Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-4" />
        </div>
      </div>
    </DashboardLayout>
  );
}
