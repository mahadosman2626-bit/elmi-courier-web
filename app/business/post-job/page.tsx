'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

const VAN_SIZES = ['Any Van', 'Small Van', 'Medium Van', 'Large Van', 'Luton Van'];
const URGENCY = ['ASAP', 'Today', 'Tomorrow', 'This Week', 'Scheduled'];

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupContact, setPickupContact] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffContact, setDropoffContact] = useState('');
  const [loadDescription, setLoadDescription] = useState('');
  const [vanSize, setVanSize] = useState('Any Van');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState('ASAP');
  const [scheduledAt, setScheduledAt] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  const canNext1 = pickupAddress.trim() && dropoffAddress.trim();
  const canNext2 = loadDescription.trim() && vanSize;
  const canSubmit = totalPrice && Number(totalPrice) >= 10;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const job = await api.post('/api/jobs', {
        pickupAddress: pickupAddress.trim(),
        pickupContact: pickupContact.trim(),
        dropoffAddress: dropoffAddress.trim(),
        dropoffContact: dropoffContact.trim(),
        loadDescription: loadDescription.trim(),
        vanSize,
        notes: notes.trim(),
        urgency,
        scheduledAt: scheduledAt || undefined,
        totalPrice: Number(totalPrice),
      });
      router.replace(`/business/jobs/${job.data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2";
  const inputStyle = { borderColor: 'var(--border)', background: 'var(--background)' };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="p-2 rounded-xl border text-sm font-bold"
            style={{ borderColor: 'var(--border)' }}>
            ←
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Post a job</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Step {step} of 3</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1.5 rounded-full"
              style={{ background: s <= step ? 'var(--accent)' : 'var(--border)' }} />
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold">Pickup & drop-off</h2>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Pickup address</label>
              <input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)}
                className={inputClass} style={inputStyle}
                placeholder="123 High Street, London, E1 6RF" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Pickup contact (optional)</label>
              <input value={pickupContact} onChange={(e) => setPickupContact(e.target.value)}
                className={inputClass} style={inputStyle}
                placeholder="Name or phone number" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Drop-off address</label>
              <input value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)}
                className={inputClass} style={inputStyle}
                placeholder="456 Market Road, Manchester, M1 2BC" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Drop-off contact (optional)</label>
              <input value={dropoffContact} onChange={(e) => setDropoffContact(e.target.value)}
                className={inputClass} style={inputStyle}
                placeholder="Name or phone number" />
            </div>
            <button onClick={() => setStep(2)} disabled={!canNext1}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold">What are you moving?</h2>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Load description</label>
              <textarea value={loadDescription} onChange={(e) => setLoadDescription(e.target.value)}
                rows={3} className={inputClass} style={inputStyle}
                placeholder="e.g. 10 cardboard boxes of office supplies, approx 80kg total" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Van size needed</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {VAN_SIZES.map((v) => (
                  <button key={v} onClick={() => setVanSize(v)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors"
                    style={{
                      background: vanSize === v ? 'var(--primary)' : 'white',
                      color: vanSize === v ? 'white' : 'var(--text-primary)',
                      borderColor: vanSize === v ? 'var(--primary)' : 'var(--border)',
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Additional notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={2} className={inputClass} style={inputStyle}
                placeholder="e.g. Fragile items, requires 2 people to lift, access code 1234" />
            </div>
            <button onClick={() => setStep(3)} disabled={!canNext2}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold">Timing & price</h2>
            <div>
              <label className="block text-xs font-semibold mb-2">When do you need it?</label>
              <div className="grid grid-cols-3 gap-2">
                {URGENCY.map((u) => (
                  <button key={u} onClick={() => setUrgency(u)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors"
                    style={{
                      background: urgency === u ? 'var(--primary)' : 'white',
                      color: urgency === u ? 'white' : 'var(--text-primary)',
                      borderColor: urgency === u ? 'var(--primary)' : 'var(--border)',
                    }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {urgency === 'Scheduled' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5">Scheduled date & time</label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                  className={inputClass} style={inputStyle} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1.5">Your price (£)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-secondary)' }}>£</span>
                <input type="number" min="10" step="1" value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  className={`${inputClass} pl-8`} style={inputStyle}
                  placeholder="0" />
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                Minimum £10. Drivers see their earnings; elmi keeps a small platform fee.
              </p>
            </div>

            {totalPrice && Number(totalPrice) >= 10 && (
              <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Driver earns</span>
                  <span className="font-bold">£{(Number(totalPrice) * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Platform fee (15%)</span>
                  <span className="font-bold">£{(Number(totalPrice) * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-bold">You pay</span>
                  <span className="font-extrabold" style={{ color: 'var(--accent)' }}>£{Number(totalPrice).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={!canSubmit || loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              {loading ? 'Posting…' : 'Post job'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
