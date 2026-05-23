'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function DriverEarningsPage() {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  useEffect(() => {
    api.get('/api/driver/earnings').then((r) => { setEarnings(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const requestWithdrawal = async () => {
    setWithdrawing(true);
    setWithdrawMsg('');
    try {
      await api.post('/api/driver/withdraw');
      setWithdrawMsg('Withdrawal requested! Funds will arrive within 2–3 business days.');
      api.get('/api/driver/earnings').then((r) => setEarnings(r.data));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setWithdrawMsg(e?.response?.data?.error || 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight mb-8">Earnings</h1>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Available to withdraw', value: `£${(earnings?.availableBalance || 0).toFixed(2)}`, color: '#16A34A', big: true },
                { label: 'Total earned (all time)', value: `£${(earnings?.totalEarnings || 0).toFixed(2)}`, color: 'var(--primary)', big: false },
                { label: 'Jobs completed', value: earnings?.totalJobs || 0, color: 'var(--text-primary)', big: false },
                { label: 'Average rating', value: earnings?.averageRating ? `⭐ ${Number(earnings.averageRating).toFixed(1)}` : '—', color: 'var(--text-primary)', big: false },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                  <p className={`font-extrabold ${s.big ? 'text-3xl' : 'text-2xl'}`} style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {withdrawMsg && (
              <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: withdrawMsg.includes('requested') ? '#F0FDF4' : '#FEF2F2',
                  color: withdrawMsg.includes('requested') ? '#16A34A' : '#DC2626',
                }}>
                {withdrawMsg}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 border mb-6" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold mb-2">Withdraw funds</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Funds are paid to your linked bank account via Stripe. Available balance: <strong>£{(earnings?.availableBalance || 0).toFixed(2)}</strong>
              </p>
              <button onClick={requestWithdrawal}
                disabled={withdrawing || !earnings?.availableBalance || earnings.availableBalance <= 0}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40"
                style={{ background: '#16A34A' }}>
                {withdrawing ? 'Processing…' : 'Request withdrawal'}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold mb-2">How it works</h2>
              <ul className="text-sm flex flex-col gap-2" style={{ color: 'var(--text-secondary)' }}>
                <li>• You earn 85% of the total job price.</li>
                <li>• Earnings are credited to your account when a job is delivered.</li>
                <li>• Withdrawals are processed via Stripe and take 2–3 business days.</li>
                <li>• You need a verified Stripe account linked in your profile to withdraw.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
