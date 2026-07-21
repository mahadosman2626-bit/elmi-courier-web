'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const API_BASE = 'https://elmi-courier-backend-production.up.railway.app';

interface Job {
  id: string;
  status: string;
  pickupAddress: string;
  pickupContact: string;
  dropoffAddress: string;
  dropoffContact: string;
  loadDescription: string;
  vanSize: string;
  urgency: string;
  notes: string;
  totalPrice: number;
  platformFee: number;
  driverEarnings: number;
  createdAt: string;
  deliveredAt: string | null;
  business: {
    email: string;
    businessProfile: { businessName: string } | null;
  } | null;
  driver: {
    name: string;
    driverProfile: { vanType: string } | null;
  } | null;
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/api/invoice/${id}`)
      .then((r) => setJob(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Loading invoice…</p>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ color: '#64748B', fontSize: 14 }}>Invoice not found.</p>
      </div>
    );
  }

  const invoiceNum = `EC-${job.id.slice(-8).toUpperCase()}`;
  const businessName = job.business?.businessProfile?.businessName || job.business?.email || '—';
  const deliveredDate = job.deliveredAt
    ? new Date(job.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const isPaid = job.status === 'DELIVERED';

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-wrapper { box-shadow: none !important; }
        }
        @page { margin: 1.5cm; }
      `}</style>

      {/* Print / close bar */}
      <div className="no-print" style={{ background: '#0F172A', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>
          elmi<span style={{ color: '#F97316' }}>.</span>
          <span style={{ color: '#ffffff70', fontWeight: 400, fontSize: 13, marginLeft: 12 }}>Invoice {invoiceNum}</span>
        </span>
        <button
          onClick={() => window.print()}
          style={{
            background: '#F97316', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          Print / Save as PDF
        </button>
      </div>

      <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 16px 80px' }}>
        <div
          className="invoice-wrapper"
          style={{
            maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 20,
            boxShadow: '0 4px 32px rgba(0,0,0,0.08)', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ background: '#0F172A', padding: '28px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
              elmi<span style={{ color: '#F97316' }}>.</span>
            </span>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: '#ffffff60', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 1 }}>Invoice</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{invoiceNum}</p>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '36px' }}>
            {/* Meta row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.8 }}>Bill to</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{businessName}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.8 }}>Date</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 8px' }}>{deliveredDate}</p>
                {isPaid && (
                  <div style={{ display: 'inline-block', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '4px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A' }}>PAID</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#E2E8F0', marginBottom: 24 }} />

            {/* Service line item */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Trusted van delivery</p>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 2px' }}>
                    {job.pickupAddress.split(',')[0]} → {job.dropoffAddress.split(',')[0]}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                    {job.loadDescription} · {job.vanSize || 'Any van'} · {job.urgency}
                  </p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', paddingLeft: 24 }}>
                  £{job.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Totals */}
            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '20px 24px', marginBottom: 28, border: '1px solid #E2E8F0' }}>
              {[
                ['Subtotal', `£${job.totalPrice.toFixed(2)}`],
                ['Platform fee (12%)', `£${(job.platformFee || 0).toFixed(2)}`],
                ['Driver earnings (88%)', `£${(job.driverEarnings || 0).toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>{label}</span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#E2E8F0', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Total paid</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0F172A' }}>£{job.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery details */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px' }}>Delivery details</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {([
                    ['Reference', invoiceNum],
                    ['Pickup address', job.pickupAddress],
                    job.pickupContact ? ['Pickup contact', job.pickupContact] : null,
                    ['Drop-off address', job.dropoffAddress],
                    job.dropoffContact ? ['Drop-off contact', job.dropoffContact] : null,
                    job.driver ? ['Driver', job.driver.name] : null,
                    job.driver?.driverProfile?.vanType ? ['Van type', job.driver.driverProfile.vanType] : null,
                    job.notes ? ['Notes', job.notes] : null,
                  ] as ([string, string] | null)[]).filter((r): r is [string, string] => r !== null).map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '6px 0', color: '#64748B', width: 160, verticalAlign: 'top' }}>{label}</td>
                      <td style={{ padding: '6px 0', color: '#0F172A', fontWeight: 600 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer note */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 20 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, textAlign: 'center' }}>
                Elmi Courier · Trusted delivery · United Kingdom<br />
                elmicouriers.co.uk · support@elmicouriers.co.uk
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
