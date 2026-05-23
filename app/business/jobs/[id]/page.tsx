'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Message { id: string; text: string; senderId: string; sender: { name: string; role: string }; createdAt: string; }
interface Job { id: string; status: string; pickupAddress: string; pickupContact: string; dropoffAddress: string; dropoffContact: string; loadDescription: string; vanSize: string; urgency: string; notes: string; totalPrice: number; driverEarnings: number; platformFee: number; scheduledAt: string | null; createdAt: string; deliveredAt: string | null; driver: { id: string; name: string; driverProfile: { vanType: string; averageRating: number; totalJobs: number } } | null; ratings: { raterId: string }[]; }

export default function BusinessJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
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

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    await api.post(`/api/jobs/${id}/messages`, { text: msgText.trim() });
    setMsgText('');
    fetchMessages();
  };

  const cancelJob = async () => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    setCancelling(true);
    await api.post(`/api/jobs/${id}/cancel`);
    fetchJob();
    setCancelling(false);
  };

  const submitRating = async () => {
    await api.post(`/api/jobs/${id}/rate`, { score: ratingScore, comment: ratingComment });
    setRatingDone(true);
    fetchJob();
  };

  if (loading) return <DashboardLayout><div className="p-8"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p></div></DashboardLayout>;
  if (!job) return <DashboardLayout><div className="p-8"><p>Job not found.</p></div></DashboardLayout>;

  const canCancel = !['DELIVERED', 'CANCELLED'].includes(job.status);
  const canRate = job.status === 'DELIVERED' && job.driver && !job.ratings.some((r) => r.raterId === user?.id);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Job details */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold mb-3">Job details</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Pickup</dt><dd className="font-medium text-right max-w-[60%]">{job.pickupAddress}</dd></div>
              {job.pickupContact && <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Pickup contact</dt><dd className="font-medium">{job.pickupContact}</dd></div>}
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Drop-off</dt><dd className="font-medium text-right max-w-[60%]">{job.dropoffAddress}</dd></div>
              {job.dropoffContact && <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Drop-off contact</dt><dd className="font-medium">{job.dropoffContact}</dd></div>}
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Load</dt><dd className="font-medium text-right max-w-[60%]">{job.loadDescription}</dd></div>
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Van size</dt><dd className="font-medium">{job.vanSize}</dd></div>
              <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Urgency</dt><dd className="font-medium">{job.urgency}</dd></div>
              {job.scheduledAt && <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Scheduled</dt><dd className="font-medium">{new Date(job.scheduledAt).toLocaleString('en-GB')}</dd></div>}
              {job.notes && <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Notes</dt><dd className="font-medium text-right max-w-[60%]">{job.notes}</dd></div>}
            </dl>
          </div>

          {/* Price & driver */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold mb-3">Payment</h2>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Total paid</dt><dd className="font-extrabold text-lg">£{job.totalPrice.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Driver earns</dt><dd className="font-medium">£{job.driverEarnings?.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt style={{ color: 'var(--text-secondary)' }}>Platform fee</dt><dd className="font-medium">£{job.platformFee?.toFixed(2)}</dd></div>
              </dl>
            </div>

            {job.driver && (
              <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold mb-3">Your driver</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: 'var(--primary)' }}>
                    {job.driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{job.driver.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      ⭐ {job.driver.driverProfile?.averageRating?.toFixed(1) || '—'} · {job.driver.driverProfile?.totalJobs || 0} jobs
                    </p>
                  </div>
                </div>
              </div>
            )}

            {canCancel && (
              <button onClick={cancelJob} disabled={cancelling}
                className="w-full py-3 rounded-xl text-sm font-bold border disabled:opacity-50"
                style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                {cancelling ? 'Cancelling…' : 'Cancel job'}
              </button>
            )}
          </div>
        </div>

        {/* Rate driver */}
        {canRate && !ratingDone && (
          <div className="bg-white rounded-2xl p-5 border mb-6" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold mb-3">Rate your driver</h2>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRatingScore(s)}
                  className="text-2xl transition-transform hover:scale-110"
                  style={{ opacity: s <= ratingScore ? 1 : 0.3 }}>⭐</button>
              ))}
            </div>
            <input value={ratingComment} onChange={(e) => setRatingComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm mb-3"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
              placeholder="Leave a comment (optional)" />
            <button onClick={submitRating} disabled={ratingScore === 0}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40"
              style={{ background: 'var(--primary)' }}>
              Submit rating
            </button>
          </div>
        )}

        {/* Chat */}
        {job.driver && (
          <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold">Chat with driver</h2>
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
                        background: isMe ? 'var(--primary)' : 'var(--background)',
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
        )}
      </div>
    </DashboardLayout>
  );
}
