'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Message { id: string; text: string; senderId: string; sender: { name: string }; createdAt: string; }
interface Job {
  id: string; status: string; pickupAddress: string; pickupContact: string;
  dropoffAddress: string; dropoffContact: string; loadDescription: string;
  vanSize: string; urgency: string; notes: string; driverEarnings: number;
  scheduledAt: string | null; createdAt: string;
  business: { name: string; businessProfile: { businessName: string } | null } | null;
  ratings: { raterId: string }[];
}

const STATUS_ACTIONS: Record<string, { label: string; endpoint: string; next: string }> = {
  ACCEPTED:   { label: 'I\'m at the pickup', endpoint: 'collecting', next: 'COLLECTING' },
  COLLECTING: { label: 'Items loaded, en route', endpoint: 'transit', next: 'IN_TRANSIT' },
  IN_TRANSIT: { label: 'Mark as delivered', endpoint: 'deliver', next: 'DELIVERED' },
};

export default function DriverJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingDone, setRatingDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchJob = () => api.get(`/api/jobs/${id}`).then((r) => setJob(r.data));
  const fetchMessages = () => api.get(`/api/jobs/${id}/messages`).then((r) => setMessages(r.data));

  useEffect(() => {
    Promise.all([fetchJob(), fetchMessages()]).finally(() => setLoading(false));
    const interval = setInterval(() => { fetchJob(); fetchMessages(); }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const advanceStatus = async () => {
    if (!job) return;
    const action = STATUS_ACTIONS[job.status];
    if (!action) return;
    setAdvancing(true);
    try {
      await api.post(`/api/jobs/${id}/${action.endpoint}`);
      fetchJob();
    } finally {
      setAdvancing(false);
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    await api.post(`/api/jobs/${id}/messages`, { text: msgText.trim() });
    setMsgText('');
    fetchMessages();
  };

  const submitRating = async () => {
    await api.post(`/api/jobs/${id}/rate`, { score: ratingScore, comment: ratingComment });
    setRatingDone(true);
    fetchJob();
  };

  if (loading) return <DashboardLayout><div className="p-8"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p></div></DashboardLayout>;
  if (!job) return <DashboardLayout><div className="p-8"><p>Job not found.</p></div></DashboardLayout>;

  const action = STATUS_ACTIONS[job.status];
  const canRate = job.status === 'DELIVERED' && !job.ratings.some((r) => r.raterId === user?.id);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl border text-sm font-bold" style={{ borderColor: 'var(--border)' }}>←</button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold tracking-tight">
              {job.pickupAddress.split(',')[0]} → {job.dropoffAddress.split(',')[0]}
            </h1>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Action button */}
        {action && (
          <button onClick={advanceStatus} disabled={advancing}
            className="w-full py-4 rounded-2xl text-white font-bold text-base mb-6 disabled:opacity-50"
            style={{ background: 'var(--accent)' }}>
            {advancing ? 'Updating…' : action.label}
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold mb-3">Job details</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Pickup</dt><dd className="font-medium text-right max-w-[60%]">{job.pickupAddress}</dd></div>
              {job.pickupContact && <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Pickup contact</dt><dd className="font-medium">{job.pickupContact}</dd></div>}
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Drop-off</dt><dd className="font-medium text-right max-w-[60%]">{job.dropoffAddress}</dd></div>
              {job.dropoffContact && <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Drop-off contact</dt><dd className="font-medium">{job.dropoffContact}</dd></div>}
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Load</dt><dd className="font-medium text-right max-w-[60%]">{job.loadDescription}</dd></div>
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Van size</dt><dd className="font-medium">{job.vanSize}</dd></div>
              {job.notes && <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Notes</dt><dd className="font-medium text-right max-w-[60%]">{job.notes}</dd></div>}
            </dl>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold mb-3">Your earnings</h2>
              <p className="text-3xl font-extrabold" style={{ color: '#16A34A' }}>£{job.driverEarnings?.toFixed(2)}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Credited on delivery</p>
            </div>

            {job.business && (
              <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold mb-2">Business</h2>
                <p className="text-sm font-medium">{job.business.businessProfile?.businessName || job.business.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rate business */}
        {canRate && !ratingDone && (
          <div className="bg-white rounded-2xl p-6 border mb-6" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#64748B' }}>Job complete</p>
            <p className="text-base font-extrabold mb-4" style={{ color: '#0F172A' }}>How was this business?</p>
            <div className="flex gap-3 mb-2">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setRatingScore(s)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: ratingScore === s ? '#1E3A8A' : '#E2E8F0',
                    background: ratingScore === s ? '#EFF6FF' : 'white',
                  }}>
                  <span className="text-2xl" style={{ filter: ratingScore >= s ? 'none' : 'grayscale(1)', opacity: ratingScore >= s ? 1 : 0.35 }}>⭐</span>
                  <span className="text-xs font-semibold" style={{ color: ratingScore === s ? '#1E3A8A' : '#94A3B8' }}>{s}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center mb-4" style={{ color: '#94A3B8' }}>
              {ratingScore === 0 ? 'Tap a star to rate' : ['','Poor','Below average','Good','Great','Excellent!'][ratingScore]}
            </p>
            <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border text-sm mb-4 resize-none focus:outline-none"
              style={{ borderColor: '#E2E8F0', background: '#F8FAFC', color: '#0F172A' }}
              placeholder="Leave a comment (optional)" />
            <button onClick={submitRating} disabled={ratingScore === 0}
              className="w-full py-3 rounded-xl text-white text-sm font-bold disabled:opacity-40 transition-opacity"
              style={{ background: '#1E3A8A' }}>
              Submit rating →
            </button>
          </div>
        )}
        {ratingDone && (
          <div className="rounded-2xl p-5 mb-6 flex items-center gap-3" style={{ background: '#ECFDF5', border: '1px solid #86EFAC' }}>
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#16A34A' }}>Thanks for your rating!</p>
              <p className="text-xs mt-0.5" style={{ color: '#15803D' }}>Your feedback helps maintain quality on Elmi.</p>
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold">Chat with business</h2>
          </div>
          <div className="h-56 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-xs text-center my-auto" style={{ color: 'var(--text-secondary)' }}>No messages yet</p>
            )}
            {messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: isMe ? 'var(--accent)' : 'var(--background)',
                      color: isMe ? 'white' : 'var(--text-primary)',
                    }}>
                    {!isMe && <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-secondary)' }}>{m.sender.name}</p>}
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
            <input value={msgText} onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
              placeholder="Type a message…" />
            <button onClick={sendMessage}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: 'var(--primary)' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
