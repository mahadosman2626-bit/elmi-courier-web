'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

const VAN_SIZES = ['Any Van', 'Small Van', 'Medium Van', 'Large Van', 'Luton Van'];
const URGENCY = ['ASAP', 'Today', 'Tomorrow', 'This Week', 'Scheduled'];

interface Place { display_name: string; lat: string; lon: string; }

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function suggestPrice(km: number): number {
  const miles = km * 0.621371;
  return Math.ceil((20 + miles * 2.5) / 5) * 5;
}

function AddressInput({
  label, value, onChange, onSelectPlace, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelectPlace: (p: Place) => void;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 4) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=gb&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: Place[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const inputStyle = { borderColor: 'var(--border)', background: 'var(--background)' };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold mb-1.5">{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 pr-10"
          style={inputStyle}
          placeholder={placeholder}
          autoComplete="off"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-secondary)' }}>…</span>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border shadow-lg overflow-hidden"
          style={{ borderColor: 'var(--border)' }}>
          {suggestions.map((s, i) => (
            <button key={i} type="button"
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b last:border-0"
              style={{ borderColor: 'var(--border)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s.display_name);
                onSelectPlace(s);
                setOpen(false);
                setSuggestions([]);
              }}>
              <span className="mr-2">📍</span>
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [pickupContact, setPickupContact] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [dropoffContact, setDropoffContact] = useState('');
  const [loadDescription, setLoadDescription] = useState('');
  const [vanSize, setVanSize] = useState('Any Van');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState('ASAP');
  const [scheduledAt, setScheduledAt] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  const distanceKm = pickupCoords && dropoffCoords
    ? haversineKm(pickupCoords.lat, pickupCoords.lon, dropoffCoords.lat, dropoffCoords.lon)
    : null;
  const suggestedPrice = distanceKm ? suggestPrice(distanceKm) : null;

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

  const mapsUrl = pickupAddress && dropoffAddress
    ? `https://www.google.com/maps/dir/${encodeURIComponent(pickupAddress)}/${encodeURIComponent(dropoffAddress)}`
    : null;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="p-2 rounded-xl border text-sm font-bold"
            style={{ borderColor: 'var(--border)' }}>←</button>
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

        {/* Step 1 — Addresses */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold">Pickup & drop-off</h2>

            <AddressInput
              label="Pickup address"
              value={pickupAddress}
              onChange={setPickupAddress}
              onSelectPlace={(p) => {
                setPickupAddress(p.display_name);
                setPickupCoords({ lat: parseFloat(p.lat), lon: parseFloat(p.lon) });
              }}
              placeholder="Start typing an address…"
            />

            <div>
              <label className="block text-xs font-semibold mb-1.5">Pickup contact (optional)</label>
              <input value={pickupContact} onChange={(e) => setPickupContact(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Name or phone number" />
            </div>

            <AddressInput
              label="Drop-off address"
              value={dropoffAddress}
              onChange={setDropoffAddress}
              onSelectPlace={(p) => {
                setDropoffAddress(p.display_name);
                setDropoffCoords({ lat: parseFloat(p.lat), lon: parseFloat(p.lon) });
              }}
              placeholder="Start typing an address…"
            />

            <div>
              <label className="block text-xs font-semibold mb-1.5">Drop-off contact (optional)</label>
              <input value={dropoffContact} onChange={(e) => setDropoffContact(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Name or phone number" />
            </div>

            {/* Route preview */}
            {pickupAddress && dropoffAddress && (
              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>ROUTE SUMMARY</p>
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold hover:underline" style={{ color: 'var(--primary)' }}>
                      View on map →
                    </a>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0 mt-1">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#1E3A8A' }} />
                    <span className="w-0.5 flex-1 my-1" style={{ background: 'var(--border)', minHeight: 24 }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#F97316' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-3 truncate" style={{ color: '#0F172A' }}>{pickupAddress}</p>
                    <p className="text-sm font-medium truncate" style={{ color: '#0F172A' }}>{dropoffAddress}</p>
                  </div>
                </div>
                {distanceKm && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Approx. distance: <strong>{distanceKm.toFixed(1)} km ({(distanceKm * 0.621).toFixed(1)} miles)</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!canNext1}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — Load */}
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

        {/* Step 3 — Price */}
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

            {/* Suggested price */}
            {suggestedPrice && !totalPrice && (
              <div className="rounded-xl p-4 border flex items-center justify-between"
                style={{ borderColor: '#1E3A8A', background: '#EFF6FF' }}>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: '#1E3A8A' }}>Suggested price</p>
                  <p className="text-xs" style={{ color: '#3B82F6' }}>
                    Based on {(distanceKm! * 0.621).toFixed(1)} miles · £20 base + £2.50/mile
                  </p>
                </div>
                <button onClick={() => setTotalPrice(String(suggestedPrice))}
                  className="px-4 py-2 rounded-xl text-white text-sm font-bold flex-shrink-0"
                  style={{ background: '#1E3A8A' }}>
                  Use £{suggestedPrice}
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5">Your price (£)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-secondary)' }}>£</span>
                <input type="number" min="10" step="1" value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  className={`${inputClass} pl-8`} style={inputStyle} placeholder="0" />
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                Minimum £10. You set the price — drivers keep 85%.
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
              {loading ? 'Posting…' : 'Post job →'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
