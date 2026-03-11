import type { Person } from '@/types';
import { personDisplayName } from '@/types';
import { usePersonActivities } from '@/hooks/usePeople';
import { usePersonSignals } from '@/hooks/useSignals';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { SignalCard } from '@/components/shared/SignalCard';
import { RelationshipTimeline } from './RelationshipTimeline';
import { Phone, Mail, Tag, ArrowLeft, Pencil } from 'lucide-react';

const TIER_LABELS: Record<string, string> = {
  A: 'Tier A — Top Priority',
  B: 'Tier B — Active',
  C: 'Tier C — Nurture',
};

interface PersonDetailPanelProps {
  person: Person;
  onBack: () => void;
  onEdit?: () => void;
}

export function PersonDetailPanel({ person, onBack, onEdit }: PersonDetailPanelProps) {
  const { data: activities = [], isLoading: activitiesLoading } = usePersonActivities(person.id);
  const { data: signals = [] } = usePersonSignals(person.id);
  const displayName = personDisplayName(person);

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div
        className="sticky top-0 backdrop-blur-sm px-6 py-4 z-10"
        style={{ background: 'rgba(248,247,244,0.9)', borderBottom: '1px solid #ECEAE5' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to People
        </button>
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600 shrink-0"
            style={{ backgroundColor: 'rgba(111,175,143,0.15)' }}
          >
            {person.first_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {person.tier && (
                <span className="text-xs text-gray-500">{TIER_LABELS[person.tier] ?? `Tier ${person.tier}`}</span>
              )}
              <HealthBadge status={person.health_status} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Contact Info */}
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</h3>
          <div className="space-y-2">
            {person.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <a href={`tel:${person.phone}`} className="hover:underline transition-colors" style={{ color: '#4a8a6a' }}>
                  {person.phone}
                </a>
              </div>
            )}
            {person.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <a href={`mailto:${person.email}`} className="hover:underline transition-colors truncate" style={{ color: '#4a8a6a' }}>
                  {person.email}
                </a>
              </div>
            )}
            {!person.phone && !person.email && (
              <p className="text-xs text-gray-400 italic">No contact details</p>
            )}
          </div>
        </div>

        {/* Location */}
        {person.suburb && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</h3>
            <p className="text-sm text-gray-700">{person.suburb}</p>
          </div>
        )}

        {/* Tags */}
        {person.tags && person.tags.length > 0 && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {person.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                  style={{ backgroundColor: 'rgba(111,175,143,0.10)', color: '#4a8a6a' }}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {person.notes && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{person.notes}</p>
          </div>
        )}

        {/* Relationship Summary */}
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Relationship Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <SummaryTile label="Last Contact" value={
              person.last_meaningful_interaction
                ? new Date(person.last_meaningful_interaction).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
                : 'Never'
            } />
            <SummaryTile label="Channel" value={person.last_interaction_channel ?? '—'} capitalize />
            <SummaryTile label="Days Since Contact" value={person.days_since_contact != null ? `${person.days_since_contact}d` : '—'} />
            <SummaryTile label="Cadence" value={person.cadence_days != null ? `Every ${person.cadence_days}d` : '—'} />
          </div>
        </div>

        {/* Signals */}
        {signals.length > 0 && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Signals</h3>
            <div className="space-y-2">
              {signals.map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Activity</h3>
          <RelationshipTimeline activities={activities} loading={activitiesLoading} />
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(111,175,143,0.06)', border: '1px solid #ECEAE5' }}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-medium text-gray-900 mt-0.5 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  );
}
