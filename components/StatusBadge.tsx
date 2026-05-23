const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  POSTED:     { bg: '#EFF6FF', color: '#1E3A8A', label: 'Posted' },
  ACCEPTED:   { bg: '#FFF7ED', color: '#F97316', label: 'Accepted' },
  COLLECTING: { bg: '#FFFBEB', color: '#D97706', label: 'Collecting' },
  IN_TRANSIT: { bg: '#F5F3FF', color: '#7C3AED', label: 'In transit' },
  DELIVERED:  { bg: '#F0FDF4', color: '#16A34A', label: 'Delivered' },
  CANCELLED:  { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#F1F5F9', color: '#64748B', label: status };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
