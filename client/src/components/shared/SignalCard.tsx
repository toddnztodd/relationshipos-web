import type { Signal, SignalType } from '@/types';

const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; bg: string; dot: string }> = {
  listing_opportunity: { label: 'Listing Opportunity', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  buyer_match: { label: 'Buyer Match', color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
  vendor_pressure: { label: 'Vendor Pressure', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  relationship_cooling: { label: 'Relationship Cooling', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
  relationship_warming: { label: 'Relationship Warming', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  community_cluster: { label: 'Community Cluster', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const cfg = SIGNAL_CONFIG[signal.signal_type] ?? {
    label: signal.signal_type,
    color: 'text-gray-700',
    bg: 'bg-gray-50 border-gray-200',
    dot: 'bg-gray-400',
  };
  const confidencePct = Math.round(signal.confidence * 100);

  return (
    <div className={`rounded-lg border px-3 py-2.5 ${cfg.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(signal.created_at)}</span>
      </div>
      <p className="mt-1 text-sm text-gray-700 leading-snug pl-4">{signal.description}</p>
      {signal.entity_name && (
        <p className="mt-0.5 text-xs text-gray-500 pl-4">{signal.entity_name}</p>
      )}
      <div className="mt-2 pl-4">
        <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full ${cfg.dot} opacity-70`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
