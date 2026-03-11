import type { Person } from '@/types';
import { personDisplayName } from '@/types';
import { usePersonActivities } from '@/hooks/usePeople';
import { usePersonSignals } from '@/hooks/useSignals';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { SignalCard } from '@/components/shared/SignalCard';
import { RelationshipTimeline } from './RelationshipTimeline';
import { Phone, Mail, Tag, ArrowLeft } from 'lucide-react';

const TIER_LABELS: Record<string, string> = {
  A: 'Tier A — Top Priority',
  B: 'Tier B — Active',
  C: 'Tier C — Nurture',
};

interface PersonDetailPanelProps {
  person: Person;
  onBack: () => void;
}

export function PersonDetailPanel({ person, onBack }: PersonDetailPanelProps) {
  const { data: activities = [], isLoading: activitiesLoading } = usePersonActivities(person.id);
  const { data: signals = [] } = usePersonSignals(person.id);
  const displayName = personDisplayName(person);

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to People
        </button>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-600 shrink-0">
            {person.first_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              {person.tier && (
                <span className="text-xs text-gray-500">{TIER_LABELS[person.tier] ?? `Tier ${person.tier}`}</span>
              )}
              <HealthBadge status={person.health_status} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Contact Info */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact</h3>
          <div className="space-y-1.5">
            {person.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <a href={`tel:${person.phone}`} className="hover:text-emerald-600 transition-colors">
                  {person.phone}
                </a>
              </div>
            )}
            {person.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <a href={`mailto:${person.email}`} className="hover:text-emerald-600 transition-colors truncate">
                  {person.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Suburb */}
        {person.suburb && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</h3>
            <p className="text-sm text-gray-600">{person.suburb}</p>
          </div>
        )}

        {/* Tags */}
        {person.tags && person.tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {person.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600"
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
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{person.notes}</p>
          </div>
        )}

        {/* Relationship Summary */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Relationship Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Last Contact</p>
              <p className="text-sm font-medium text-gray-900">
                {person.last_meaningful_interaction
                  ? new Date(person.last_meaningful_interaction).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
                  : 'Never'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Channel</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {person.last_interaction_channel ?? '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Days Since Contact</p>
              <p className="text-sm font-medium text-gray-900">
                {person.days_since_contact != null ? `${person.days_since_contact}d` : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Cadence</p>
              <p className="text-sm font-medium text-gray-900">
                {person.cadence_days != null ? `Every ${person.cadence_days}d` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Signals */}
        {signals.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Signals</h3>
            <div className="space-y-2">
              {signals.map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Activity</h3>
          <RelationshipTimeline activities={activities} loading={activitiesLoading} />
        </div>
      </div>
    </div>
  );
}
