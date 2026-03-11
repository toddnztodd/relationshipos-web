import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import type { Person, Referral, ReferralStatus, RewardStatus } from '@/types';
import { personDisplayName } from '@/types';
import { usePersonActivities } from '@/hooks/usePeople';
import { usePersonSignals } from '@/hooks/useSignals';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { SignalCard } from '@/components/shared/SignalCard';
import { MatchCard } from '@/components/shared/MatchCard';
import { RelationshipTimeline } from './RelationshipTimeline';
import { getPropertyBuyerInterest, getBuyerMatches, registerReferralMember, getPersonReferrals, updateReferral } from '@/lib/api';
import { Phone, Mail, Tag, ArrowLeft, Pencil, DollarSign, UserPlus, ChevronDown, Link2, Check } from 'lucide-react';

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

        {/* Referral Programme */}
        <ReferralSection person={person} />

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

        {/* Matching Properties */}
        <MatchingPropertiesSection personId={person.id} />

        {/* Activity Timeline */}
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Activity</h3>
          <RelationshipTimeline activities={activities} loading={activitiesLoading} />
        </div>
      </div>
    </div>
  );
}

const REFERRAL_STATUS_STYLES: Record<ReferralStatus, { bg: string; text: string; label: string }> = {
  registered: { bg: 'rgba(156,163,175,0.15)', text: '#6b7280', label: 'Registered' },
  referral_received: { bg: 'rgba(59,130,246,0.12)', text: '#2563eb', label: 'Referral Received' },
  listing_secured: { bg: 'rgba(245,158,11,0.12)', text: '#d97706', label: 'Listing Secured' },
  sold: { bg: 'rgba(111,175,143,0.15)', text: '#4a8a6a', label: 'Sold' },
  closed: { bg: 'rgba(156,163,175,0.15)', text: '#6b7280', label: 'Closed' },
};

const REWARD_STATUS_STYLES: Record<RewardStatus, { bg: string; text: string; label: string } | null> = {
  none: null,
  pending: { bg: 'rgba(245,158,11,0.12)', text: '#d97706', label: 'Reward Pending' },
  earned: { bg: 'rgba(111,175,143,0.15)', text: '#4a8a6a', label: 'Reward Earned' },
  paid: { bg: 'rgba(156,163,175,0.12)', text: '#6b7280', label: 'Reward Paid \u2713' },
};

function ReferralSection({ person }: { person: Person }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(!!person.referral_member);
  const [toast, setToast] = useState<string | null>(null);

  const loadReferrals = useCallback(async () => {
    try {
      const data = await getPersonReferrals(person.id);
      setReferrals(Array.isArray(data) ? data : []);
    } catch { setReferrals([]); }
    setLoading(false);
  }, [person.id]);

  useEffect(() => { loadReferrals(); }, [loadReferrals]);
  useEffect(() => { setRegistered(!!person.referral_member); }, [person.referral_member]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await registerReferralMember(person.id, { reward_amount: 250 });
      setRegistered(true);
      setToast(person.email ? 'Registered \u2014 confirmation email sent' : 'Registered \u2014 no email on file');
    } catch { setToast('Registration failed'); }
    setRegistering(false);
  };

  const handleStatusUpdate = async (referralId: string, field: string, value: string) => {
    try {
      await updateReferral(referralId, { [field]: value });
      loadReferrals();
    } catch { /* silent */ }
  };

  const madeReferrals = referrals.filter(r => String(r.referrer_person_id) === String(person.id));
  const receivedReferrals = referrals.filter(r => String(r.referred_person_id) === String(person.id));

  return (
    <div className="relate-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-4 h-4" style={{ color: '#6FAF8F' }} />
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Referral Programme</h3>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#6FAF8F' }}>
          {toast}
        </div>
      )}

      {/* State 1: Not registered */}
      {!registered && !loading && receivedReferrals.length === 0 && (
        <div className="text-center py-3">
          <p className="text-xs text-gray-500 mb-2">Not in the referral programme</p>
          <button
            onClick={handleRegister}
            disabled={registering}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#6FAF8F' }}
          >
            <DollarSign className="w-3 h-3" />
            {registering ? 'Registering\u2026' : 'Register for Referral Programme'}
          </button>
        </div>
      )}

      {/* State 2: Registered member */}
      {registered && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#6FAF8F' }}>
              <DollarSign className="w-2.5 h-2.5" /> Referral Member
            </span>
            <span className="text-xs text-gray-500">${person.referral_reward_amount ?? 250} reward</span>
          </div>
          {person.referral_email_sent_at && (
            <p className="text-[10px] text-gray-400">Email sent {new Date(person.referral_email_sent_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          )}
          {madeReferrals.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">People Referred ({madeReferrals.length})</p>
              <div className="space-y-1.5">
                {madeReferrals.map(r => (
                  <ReferralRow key={r.id} referral={r} displayPerson={r.referred} onStatusUpdate={handleStatusUpdate} />
                ))}
              </div>
            </div>
          )}
          {madeReferrals.length === 0 && (
            <p className="text-xs text-gray-400 italic">No referrals made yet</p>
          )}
        </div>
      )}

      {/* State 3: Was referred by someone */}
      {receivedReferrals.length > 0 && (
        <div className={registered ? 'mt-3 pt-3 border-t border-gray-100' : ''}>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Referred By</p>
          <div className="space-y-1.5">
            {receivedReferrals.map(r => (
              <ReferralRow key={r.id} referral={r} displayPerson={r.referrer} onStatusUpdate={handleStatusUpdate} isIncoming />
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-3">
          <div className="w-6 h-6 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
        </div>
      )}
    </div>
  );
}

function ReferralRow({ referral, displayPerson, onStatusUpdate, isIncoming }: {
  referral: Referral;
  displayPerson?: Person;
  onStatusUpdate: (id: string, field: string, value: string) => void;
  isIncoming?: boolean;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const name = displayPerson ? personDisplayName(displayPerson) : (isIncoming ? 'Unknown referrer' : 'Unknown person');
  const statusStyle = REFERRAL_STATUS_STYLES[referral.referral_status] || REFERRAL_STATUS_STYLES.registered;
  const rewardStyle = REWARD_STATUS_STYLES[referral.reward_status];

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(111,175,143,0.04)', border: '1px solid #ECEAE5' }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-500 shrink-0" style={{ backgroundColor: 'rgba(111,175,143,0.12)' }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{name}</p>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
            {statusStyle.label}
          </span>
          {rewardStyle && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: rewardStyle.bg, color: rewardStyle.text }}>
              {rewardStyle.label}
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border border-gray-200 bg-white z-20 py-1">
            <p className="px-2 py-1 text-[9px] font-semibold text-gray-400 uppercase">Status</p>
            {(['registered', 'referral_received', 'listing_secured', 'sold', 'closed'] as ReferralStatus[]).map(s => (
              <button
                key={s}
                onClick={() => { onStatusUpdate(referral.id, 'referral_status', s); setShowDropdown(false); }}
                className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-50 flex items-center gap-1.5 ${referral.referral_status === s ? 'font-semibold' : ''}`}
              >
                {referral.referral_status === s && <Check className="w-2.5 h-2.5" style={{ color: '#6FAF8F' }} />}
                {REFERRAL_STATUS_STYLES[s].label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-1" />
            <p className="px-2 py-1 text-[9px] font-semibold text-gray-400 uppercase">Reward</p>
            {(['none', 'pending', 'earned', 'paid'] as RewardStatus[]).map(s => (
              <button
                key={s}
                onClick={() => { onStatusUpdate(referral.id, 'reward_status', s); setShowDropdown(false); }}
                className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-50 flex items-center gap-1.5 ${referral.reward_status === s ? 'font-semibold' : ''}`}
              >
                {referral.reward_status === s && <Check className="w-2.5 h-2.5" style={{ color: '#6FAF8F' }} />}
                {s === 'none' ? 'None' : (REWARD_STATUS_STYLES[s]?.label ?? s)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchingPropertiesSection({ personId }: { personId: number }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // First get buyer interests for this person, then fetch matches for each
    getPropertyBuyerInterest(personId)
      .then(async (interests: any[]) => {
        if (cancelled) return;
        // Only show for interests with stage >= interested
        const qualifying = (interests || []).filter((bi: any) => {
          const stage = bi.status || bi.stage;
          return ['interested', 'hot', 'offer', 'purchased'].includes(stage);
        });
        if (qualifying.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }
        const allMatches: any[] = [];
        for (const bi of qualifying) {
          try {
            const m = await getBuyerMatches(bi.id);
            if (Array.isArray(m)) allMatches.push(...m);
          } catch { /* skip */ }
        }
        if (!cancelled) setMatches(allMatches);
      })
      .catch(() => { if (!cancelled) setMatches([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [personId]);

  if (!loading && matches.length === 0) return null;

  return (
    <div className="relate-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Matching Properties</h3>
        {matches.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#6FAF8F' }}>
            {matches.length}
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-2 bg-gray-100 rounded animate-pulse w-1/3" />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.slice(0, 5).map((m: any, i: number) => (
            <MatchCard
              key={m.property?.id || i}
              type="property"
              name={m.property?.address || 'Unknown property'}
              score={m.score_pct ?? m.score ?? 0}
              reasons={m.reasons || []}
              onClick={() => {
                if (m.property?.id) setLocation(`/properties`);
              }}
            />
          ))}
        </div>
      )}
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
