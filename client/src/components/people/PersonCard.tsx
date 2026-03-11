import type { Person } from '@/types';
import { personDisplayName } from '@/types';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { cn } from '@/lib/utils';
import { Phone, Mail, Clock, Trash2 } from 'lucide-react';

const TIER_COLORS: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-blue-500',
  C: 'bg-amber-500',
};

function daysSince(dateStr?: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

interface PersonCardProps {
  person: Person;
  selected?: boolean;
  selectionMode?: boolean;
  isChecked?: boolean;
  onToggleCheck?: (id: number) => void;
  onClick: () => void;
  onDelete?: (person: Person) => void;
}

export function PersonCard({
  person,
  selected,
  selectionMode,
  isChecked,
  onToggleCheck,
  onClick,
  onDelete,
}: PersonCardProps) {
  const displayName = personDisplayName(person);
  const initials = person.first_name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'w-full text-left px-4 py-3 rounded-xl border transition-all group',
        selected
          ? 'bg-white border-emerald-200 shadow-sm'
          : 'bg-white/60 border-transparent hover:bg-white hover:border-gray-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox in selection mode */}
        {selectionMode && (
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              checked={isChecked ?? false}
              onChange={() => onToggleCheck?.(person.id)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        )}

        {/* Clickable area */}
        <button onClick={onClick} className="flex items-start gap-3 flex-1 min-w-0 text-left">
          {/* Avatar with tier indicator */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
              {initials}
            </div>
            {person.tier && (
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center',
                  TIER_COLORS[person.tier] ?? 'bg-gray-400'
                )}
              >
                {person.tier}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">{displayName}</span>
              <HealthBadge status={person.health_status} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {person.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {person.phone}
                </span>
              )}
              {person.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3" />
                  {person.email}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Last contact: {daysSince(person.last_meaningful_interaction)}</span>
              {person.last_interaction_channel && (
                <span className="text-gray-300">via {person.last_interaction_channel}</span>
              )}
            </div>
          </div>
        </button>

        {/* Delete button — visible on hover, hidden in selection mode */}
        {!selectionMode && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(person);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 mt-1"
            title="Remove contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
