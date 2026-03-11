import type { Person } from '@/types';
import { personDisplayName } from '@/types';
import { UserCheck, Clock } from 'lucide-react';

interface ContactReappearancePromptProps {
  match: Person;
  matchType: 'phone' | 'email' | 'name';
  onRestore: () => void;
  onKeepSeparate: () => void;
  onIgnore: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

const MATCH_LABELS: Record<string, string> = {
  phone: 'Phone number match',
  email: 'Email match',
  name: 'Name match',
};

export function ContactReappearancePrompt({
  match,
  matchType,
  onRestore,
  onKeepSeparate,
  onIgnore,
}: ContactReappearancePromptProps) {
  const displayName = personDisplayName(match);

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-amber-100 shrink-0 mt-0.5">
          <UserCheck className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">We've seen this contact before</h4>
          <p className="text-xs text-amber-700 mt-0.5">{MATCH_LABELS[matchType] ?? 'Match found'}</p>

          {/* Match details */}
          <div className="mt-2 p-3 rounded-lg bg-white border border-amber-100">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            {(match as unknown as { vault_note?: string }).vault_note && (
              <p className="text-xs text-gray-500 mt-1 italic">
                "{(match as unknown as { vault_note?: string }).vault_note}"
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Vaulted {timeAgo(match.updated_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onRestore}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Restore contact
            </button>
            <button
              onClick={onKeepSeparate}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Keep separate
            </button>
            <button
              onClick={onIgnore}
              className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
