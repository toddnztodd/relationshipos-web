import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useSearch } from 'wouter';
import {
  startDoorKnockSession, endDoorKnockSession, logDoorKnockEntry,
  createContactFromEntry, getNearbySuggestions, createFollowUpTask,
  getProperties, getDoorKnockSession,
} from '@/lib/api';
import { VoiceRecorder } from '@/components/shared/VoiceRecorder';
import type { KnockResult, InterestLevel, DoorKnockEntry, Property } from '@/types';
import {
  ArrowLeft, DoorOpen, Mic, Phone, User, MapPin, X, Check,
  ChevronRight, Loader2, Hash, ClipboardList, UserPlus, Navigation,
  Home, Users, Handshake, Contact, LucideIcon,
} from 'lucide-react';
import { haptic, HapticPattern } from '@/lib/utils';
import { toast } from 'sonner';

type Phase = 'start' | 'active' | 'post_knock' | 'nearby' | 'summary';

const KNOCK_RESULTS: { value: KnockResult; label: string; color: string; bg: string; Icon: LucideIcon }[] = [
  { value: 'no_answer', label: 'No Answer', color: 'text-gray-600', bg: 'bg-gray-100 hover:bg-gray-200', Icon: DoorOpen },
  { value: 'spoke_to_owner', label: 'Spoke to Owner', color: 'text-emerald-700', bg: 'bg-emerald-50 hover:bg-emerald-100', Icon: Home },
  { value: 'spoke_to_occupant', label: 'Spoke to Occupant', color: 'text-teal-700', bg: 'bg-teal-50 hover:bg-teal-100', Icon: Users },
  { value: 'door_knocked', label: 'Door Knocked', color: 'text-blue-700', bg: 'bg-blue-50 hover:bg-blue-100', Icon: Handshake },
  { value: 'contact_captured', label: 'Contact Captured', color: 'text-amber-700', bg: 'bg-amber-50 hover:bg-amber-100', Icon: Contact },
];

const INTEREST_LEVELS: { value: InterestLevel; label: string; color: string }[] = [
  { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-200 text-gray-700' },
  { value: 'neutral', label: 'Neutral', color: 'bg-blue-100 text-blue-700' },
  { value: 'possibly_selling', label: 'Possibly Selling', color: 'bg-amber-100 text-amber-700' },
  { value: 'actively_considering', label: 'Actively Considering', color: 'bg-emerald-100 text-emerald-700' },
];

const RESULT_BADGE: Record<KnockResult, { label: string; color: string }> = {
  no_answer: { label: 'No Answer', color: 'bg-gray-100 text-gray-600' },
  spoke_to_owner: { label: 'Spoke to Owner', color: 'bg-emerald-50 text-emerald-700' },
  spoke_to_occupant: { label: 'Spoke to Occupant', color: 'bg-teal-50 text-teal-700' },
  door_knocked: { label: 'Door Knocked', color: 'bg-blue-50 text-blue-700' },
  contact_captured: { label: 'Contact Captured', color: 'bg-amber-50 text-amber-700' },
};

export default function DoorKnockPage() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const params = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const territoryId = params.get('territory_id') || undefined;
  const territoryName = params.get('territory_name') || undefined;

  const [phase, setPhase] = useState<Phase>('start');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [entries, setEntries] = useState<DoorKnockEntry[]>([]);
  const [starting, setStarting] = useState(false);

  // Active session state
  const [address, setAddress] = useState('');
  const [matchedPropertyId, setMatchedPropertyId] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);

  // Post-knock state
  const [lastEntry, setLastEntry] = useState<DoorKnockEntry | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [interestLevel, setInterestLevel] = useState<InterestLevel | ''>('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [creatingContact, setCreatingContact] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpTitle, setFollowUpTitle] = useState('');

  // Nearby state
  const [nearbyData, setNearbyData] = useState<any>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Load properties for address matching
  useEffect(() => {
    getProperties().then(setAllProperties).catch(() => {});
  }, []);

  const filteredProperties = useMemo(() => {
    if (!address.trim() || address.length < 2) return [];
    const q = address.toLowerCase();
    return allProperties
      .filter((p) => p.address.toLowerCase().includes(q) || (p.suburb && p.suburb.toLowerCase().includes(q)))
      .slice(0, 5);
  }, [address, allProperties]);

  // ── Start Session ──
  async function handleStartSession() {
    setStarting(true);
    try {
      const session = await startDoorKnockSession({ territory_id: territoryId });
      setSessionId(session.id);
      setPhase('active');
      toast.success('Door knock session started');
    } catch {
      toast.error('Failed to start session');
    } finally {
      setStarting(false);
    }
  }

  // ── Log Knock ──
  async function handleKnock(result: KnockResult) {
    if (!address.trim() || !sessionId) return;
    haptic(HapticPattern.knock);
    try {
      const entry = await logDoorKnockEntry({
        session_id: sessionId,
        property_id: matchedPropertyId || undefined,
        property_address: address.trim(),
        knock_result: result,
      });
      setEntries((prev) => [...prev, entry]);
      setLastEntry(entry);
      setPhase('post_knock');
    } catch {
      toast.error('Failed to log knock');
    }
  }

  // ── Create Contact ──
  async function handleCreateContact() {
    if (!lastEntry) return;
    setCreatingContact(true);
    try {
      await createContactFromEntry(lastEntry.id);
      toast.success('Contact created');
    } catch {
      toast.error('Failed to create contact');
    } finally {
      setCreatingContact(false);
    }
  }

  // ── Follow-up Task ──
  async function handleCreateFollowUp() {
    if (!followUpTitle.trim()) return;
    try {
      await createFollowUpTask({
        title: followUpTitle.trim(),
        related_property_id: matchedPropertyId || undefined,
        description: `From door knock at ${address}`,
      });
      toast.success('Follow-up task created');
      setShowFollowUp(false);
      setFollowUpTitle('');
    } catch {
      toast.error('Failed to create task');
    }
  }

  // ── 10-10-20 Nearby ──
  async function handleNearby() {
    if (!matchedPropertyId) {
      toast('No matched property — nearby suggestions need a known property');
      return;
    }
    setLoadingNearby(true);
    setPhase('nearby');
    try {
      const data = await getNearbySuggestions(matchedPropertyId);
      setNearbyData(data);
    } catch {
      setNearbyData({ left: [], right: [], across: [] });
    } finally {
      setLoadingNearby(false);
    }
  }

  // ── Next House ──
  function handleNextHouse() {
    setPhase('active');
    setAddress('');
    setMatchedPropertyId(null);
    setLastEntry(null);
    setContactName('');
    setContactPhone('');
    setInterestLevel('');
    setVoiceTranscript('');
    setShowFollowUp(false);
    setFollowUpTitle('');
    setTimeout(() => addressRef.current?.focus(), 100);
  }

  // ── End Session ──
  async function handleEndSession() {
    if (!sessionId) return;
    try {
      await endDoorKnockSession(sessionId);
    } catch { /* silent */ }
    setPhase('summary');
  }

  // ── Select nearby property ──
  function selectNearbyProperty(addr: string) {
    setAddress(addr);
    const match = allProperties.find((p) => p.address === addr);
    setMatchedPropertyId(match ? String(match.id) : null);
    setPhase('active');
  }

  const showPostKnockDetails = lastEntry && (
    lastEntry.knock_result === 'spoke_to_owner' ||
    lastEntry.knock_result === 'spoke_to_occupant' ||
    lastEntry.knock_result === 'contact_captured'
  );

  // ══════════════════════════════════════════════════════════
  // SESSION START
  // ══════════════════════════════════════════════════════════
  if (phase === 'start') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#F8F7F4' }}>
        <button
          onClick={() => setLocation(territoryId ? '/territory' : '/')}
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(111,175,143,0.12)' }}>
            <DoorOpen className="w-10 h-10" style={{ color: '#6FAF8F' }} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Door Knock Mode</h1>
          {territoryName && (
            <p className="text-sm text-gray-500 mb-1">
              <MapPin className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
              {territoryName}
            </p>
          )}
          <p className="text-sm text-gray-400 mb-8">
            Voice-first field workflow — log knocks fast, one-handed
          </p>

          <button
            onClick={handleStartSession}
            disabled={starting}
            className="w-full py-4 rounded-2xl text-lg font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#6FAF8F' }}
          >
            {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <DoorOpen className="w-5 h-5" />}
            Start Session
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SESSION SUMMARY
  // ══════════════════════════════════════════════════════════
  if (phase === 'summary') {
    const resultCounts: Record<string, number> = {};
    entries.forEach((e) => {
      resultCounts[e.knock_result] = (resultCounts[e.knock_result] || 0) + 1;
    });
    const contactsCaptured = entries.filter((e) => e.knock_result === 'contact_captured').length;
    const [showEntries, setShowEntries] = useState(false);

    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={{ backgroundColor: '#F8F7F4' }}>
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(111,175,143,0.12)' }}>
              <Check className="w-8 h-8" style={{ color: '#6FAF8F' }} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Session Complete</h1>
            {territoryName && <p className="text-xs text-gray-500">{territoryName}</p>}
          </div>

          {/* Stats */}
          <div className="relate-card p-5 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold" style={{ color: '#6FAF8F' }}>{entries.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total Knocks</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-600">{contactsCaptured}</p>
                <p className="text-xs text-gray-500 mt-1">Contacts</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">{Object.keys(resultCounts).length}</p>
                <p className="text-xs text-gray-500 mt-1">Result Types</p>
              </div>
            </div>
          </div>

          {/* Results breakdown */}
          <div className="relate-card p-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Results Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(resultCounts).map(([result, count]) => {
                const cfg = RESULT_BADGE[result as KnockResult];
                const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                return (
                  <div key={result} className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg?.color || 'bg-gray-100 text-gray-600'}`}>
                      {cfg?.label || result}
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#ECEAE5' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#6FAF8F' }} />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View entries */}
          <div className="relate-card p-4 mb-6">
            <button
              onClick={() => setShowEntries(!showEntries)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              View Entries ({entries.length})
              <ChevronRight className={`w-4 h-4 transition-transform ${showEntries ? 'rotate-90' : ''}`} />
            </button>
            {showEntries && (
              <div className="mt-3 space-y-2">
                {entries.map((e, i) => {
                  const cfg = RESULT_BADGE[e.knock_result];
                  return (
                    <div key={e.id || i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#ECEAE5' }}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{e.property_address}</p>
                        {e.contact_name && <p className="text-xs text-gray-500">{e.contact_name}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${cfg?.color || 'bg-gray-100 text-gray-600'}`}>
                        {cfg?.label || e.knock_result}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setLocation(territoryId ? '/territory' : '/')}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#6FAF8F' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // 10-10-20 NEARBY PANEL
  // ══════════════════════════════════════════════════════════
  if (phase === 'nearby') {
    const groups = nearbyData
      ? [
          { label: 'Left', items: Array.isArray(nearbyData.left) ? nearbyData.left : [] },
          { label: 'Right', items: Array.isArray(nearbyData.right) ? nearbyData.right : [] },
          { label: 'Across', items: Array.isArray(nearbyData.across) ? nearbyData.across : [] },
        ]
      : [];

    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={{ backgroundColor: '#F8F7F4' }}>
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">10-10-20 Nearby</h2>
            <button
              onClick={() => setPhase('post_knock')}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loadingNearby ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.label}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{g.label}</h3>
                  {g.items.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">No suggestions</p>
                  ) : (
                    <div className="space-y-1">
                      {g.items.map((item: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => selectNearbyProperty(item.address || item)}
                          className="w-full text-left relate-card p-3 hover:shadow-md transition-shadow flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.address || item}</p>
                            {item.sellability_score != null && (
                              <p className="text-xs text-gray-500">Sellability: {item.sellability_score}/5</p>
                            )}
                          </div>
                          <Navigation className="w-4 h-4 text-gray-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // ACTIVE SESSION + POST-KNOCK PANEL
  // ══════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F8F7F4' }}>
      {/* Top bar */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #ECEAE5' }}>
        <div className="flex items-center gap-3 min-w-0">
          {territoryName && (
            <span className="text-xs text-gray-500 truncate">
              <MapPin className="w-3 h-3 inline -mt-0.5 mr-0.5" />
              {territoryName}
            </span>
          )}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(111,175,143,0.12)', color: '#4a8a6a' }}>
            <Hash className="w-3 h-3" />
            {entries.length} knocks
          </span>
        </div>
        <button
          onClick={handleEndSession}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Address input */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Address</label>
            <input
              ref={addressRef}
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setMatchedPropertyId(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter address or search property…"
              className="w-full px-4 py-3.5 rounded-2xl border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors"
              style={{ borderColor: '#ECEAE5' }}
              autoFocus
            />
            {matchedPropertyId && (
              <span className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Matched
              </span>
            )}

            {/* Property suggestions */}
            {showSuggestions && filteredProperties.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-10 relate-card p-1 max-h-48 overflow-auto">
                {filteredProperties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setAddress(p.address);
                      setMatchedPropertyId(String(p.id));
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{p.address}</span>
                    {p.suburb && <span className="text-gray-400 ml-1">· {p.suburb}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Knock result buttons */}
          {address.trim() && phase === 'active' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Log Result</p>
              {KNOCK_RESULTS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleKnock(r.value)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-all active:scale-[0.96] active:knock-tap ${r.bg}`}
                  style={{ minHeight: '56px' }}
                >
                  <r.Icon size={20} />
                  <span className={`text-sm font-semibold ${r.color}`}>{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!address.trim() && phase === 'active' && (
            <div className="text-center py-12">
              <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Type an address to start logging knocks</p>
            </div>
          )}
        </div>
      </div>

      {/* ── POST-KNOCK PANEL (slides up from bottom) ── */}
      {phase === 'post_knock' && lastEntry && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-auto rounded-t-3xl shadow-2xl"
          style={{ backgroundColor: '#F8F7F4', borderTop: '1px solid #ECEAE5' }}
        >
          <div className="max-w-md mx-auto px-5 py-5">
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />

            {/* Address + result badge */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900 truncate">{lastEntry.property_address}</p>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0 ${RESULT_BADGE[lastEntry.knock_result]?.color || 'bg-gray-100 text-gray-600'}`}>
                {RESULT_BADGE[lastEntry.knock_result]?.label || lastEntry.knock_result}
              </span>
            </div>

            {/* Contact details (if spoke to someone) */}
            {showPostKnockDetails && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    <User className="w-3 h-3 inline -mt-0.5 mr-1" />Contact Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Name…"
                    className="w-full px-3.5 py-3 rounded-xl border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                    style={{ borderColor: '#ECEAE5' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    <Phone className="w-3 h-3 inline -mt-0.5 mr-1" />Phone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone…"
                    className="w-full px-3.5 py-3 rounded-xl border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                    style={{ borderColor: '#ECEAE5' }}
                  />
                </div>

                {/* Interest level */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Interest Level</label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_LEVELS.map((il) => (
                      <button
                        key={il.value}
                        onClick={() => setInterestLevel(il.value === interestLevel ? '' : il.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          interestLevel === il.value
                            ? il.color + ' ring-2 ring-offset-1 ring-[#6FAF8F]'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {il.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Voice note */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                <Mic className="w-3 h-3 inline -mt-0.5 mr-1" />Voice Note
              </label>
              <VoiceRecorder
                label="Record voice note"
                onTranscript={(text) => setVoiceTranscript(text)}
                onParsed={(data) => {
                  if (data.transcript || data.text || data.transcription) {
                    setVoiceTranscript(data.transcript || data.text || data.transcription);
                  }
                }}
              />
              {voiceTranscript && (
                <textarea
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-xl border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                  style={{ borderColor: '#ECEAE5' }}
                  rows={3}
                  placeholder="Edit transcript…"
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Create Contact */}
              {(contactName || contactPhone) && (
                <button
                  onClick={handleCreateContact}
                  disabled={creatingContact}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: '#6FAF8F' }}
                >
                  {creatingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create Contact
                </button>
              )}

              {/* 10-10-20 Nearby */}
              {matchedPropertyId && (
                <button
                  onClick={handleNearby}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium border transition-all hover:bg-gray-50 active:scale-[0.98]"
                  style={{ borderColor: '#ECEAE5', color: '#6FAF8F' }}
                >
                  <Navigation className="w-4 h-4" />
                  10-10-20 Nearby
                </button>
              )}

              {/* Follow-up task */}
              {!showFollowUp ? (
                <button
                  onClick={() => setShowFollowUp(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-gray-600 border transition-all hover:bg-gray-50 active:scale-[0.98]"
                  style={{ borderColor: '#ECEAE5' }}
                >
                  <ClipboardList className="w-4 h-4" />
                  Add Follow-up Task
                </button>
              ) : (
                <div className="relate-card p-3 space-y-2">
                  <input
                    type="text"
                    value={followUpTitle}
                    onChange={(e) => setFollowUpTitle(e.target.value)}
                    placeholder="Follow-up task title…"
                    className="w-full px-3 py-2 rounded-xl border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                    style={{ borderColor: '#ECEAE5' }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateFollowUp}
                      disabled={!followUpTitle.trim()}
                      className="flex-1 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50"
                      style={{ backgroundColor: '#6FAF8F' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowFollowUp(false); setFollowUpTitle(''); }}
                      className="px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Next House */}
              <button
                onClick={handleNextHouse}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#374151' }}
              >
                Next House
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
