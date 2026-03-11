import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  getTerritories, getTerritory, createTerritory, updateTerritory, deleteTerritory,
  getTerritoryCoverage, getTerritorySignals, getProperties,
  linkPropertyToTerritory, unlinkPropertyFromTerritory,
  logCoverageActivity, getTerritoryFarmingPrograms, createFarmingProgram,
  updateFarmingProgram, deleteFarmingProgram,
} from '@/lib/api';
import { SignalCard } from '@/components/shared/SignalCard';
import type { Territory, TerritoryType, CoverageSummary, CoverageActivity, FarmingProgram, Signal, Property } from '@/types';
import {
  Loader2, Plus, ArrowLeft, MapPin, Flag, Home, Users, TrendingUp, Zap,
  X, Pencil, Trash2, Check, RotateCcw, FileText, Footprints, Mail, DoorOpen, Heart, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';

// ── Constants ──
const TYPE_CONFIG: Record<TerritoryType, { label: string; color: string; bg: string }> = {
  core_territory: { label: 'Core Territory', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  expansion_zone: { label: 'Expansion Zone', color: 'text-amber-700', bg: 'bg-amber-50' },
  tactical_route: { label: 'Route', color: 'text-blue-700', bg: 'bg-blue-50' },
};

const ACTIVITY_TYPES = [
  { value: 'territory_intro', label: 'Territory Intro', icon: Footprints },
  { value: 'flyer_drop', label: 'Flyer Drop', icon: FileText },
  { value: 'magnet_drop', label: 'Magnet Drop', icon: MapPin },
  { value: 'door_knock', label: 'Door Knock', icon: DoorOpen },
  { value: 'welcome_touch', label: 'Welcome Touch', icon: Heart },
  { value: 'market_update', label: 'Market Update', icon: BarChart3 },
] as const;

function formatDate(d: string | undefined | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(d: string | undefined | null): boolean {
  if (!d) return false;
  return new Date(d) < new Date();
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function TerritoryPage() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    getTerritories()
      .then(setTerritories)
      .catch(() => setTerritories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (showCreate) {
    return (
      <CreateTerritoryModal
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchAll(); }}
      />
    );
  }

  if (selectedId) {
    return (
      <TerritoryDetail
        id={selectedId}
        onBack={() => { setSelectedId(null); fetchAll(); }}
      />
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Territory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {territories.length} territor{territories.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#6FAF8F' }}
        >
          <Plus className="w-4 h-4" />
          Add Territory
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : territories.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No territories yet — add your first farming area</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: '#6FAF8F' }}
          >
            Add territory
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {territories.map((t) => (
            <TerritoryCard key={t.id} territory={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TERRITORY CARD
// ══════════════════════════════════════════════════════════
function TerritoryCard({ territory: t, onClick }: { territory: Territory; onClick: () => void }) {
  const cfg = TYPE_CONFIG[t.type] ?? TYPE_CONFIG.core_territory;
  const coveragePct = t.property_count > 0
    ? Math.round((t.owners_known / t.property_count) * 100)
    : 0;

  return (
    <button onClick={onClick} className="w-full text-left relate-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1"><Home className="w-3 h-3" />{t.property_count} properties</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.owners_known} owners</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{t.relationships_known} relationships</span>
            {t.signal_count > 0 && (
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{t.signal_count} signals</span>
            )}
          </div>
        </div>
      </div>

      {/* Coverage bar */}
      {t.property_count > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Coverage</span>
            <span className="text-[10px] font-medium" style={{ color: '#6FAF8F' }}>{coveragePct}% introduced</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#ECEAE5' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${coveragePct}%`, backgroundColor: '#6FAF8F' }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

// ══════════════════════════════════════════════════════════
// TERRITORY DETAIL
// ══════════════════════════════════════════════════════════
type DetailTab = 'overview' | 'properties' | 'coverage' | 'programs';

function TerritoryDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DetailTab>('overview');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', type: '' as TerritoryType, notes: '' });

  const fetchDetail = useCallback(() => {
    setLoading(true);
    getTerritory(id)
      .then((t) => {
        setTerritory(t);
        setEditForm({ name: t.name, type: t.type, notes: t.notes || '' });
      })
      .catch(() => toast.error('Failed to load territory'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  async function handleSaveEdit() {
    try {
      await updateTerritory(id, editForm);
      setEditing(false);
      fetchDetail();
      toast.success('Territory updated');
    } catch { toast.error('Failed to update'); }
  }

  async function handleDelete() {
    if (!confirm('Delete this territory?')) return;
    try {
      await deleteTerritory(id);
      toast.success('Territory deleted');
      onBack();
    } catch { toast.error('Failed to delete'); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!territory) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <p className="text-sm text-gray-500">Territory not found</p>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[territory.type] ?? TYPE_CONFIG.core_territory;
  const TABS: { key: DetailTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'properties', label: 'Properties' },
    { key: 'coverage', label: 'Coverage' },
    { key: 'programs', label: 'Programs' },
  ];

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4" style={{ background: 'rgba(248,247,244,0.95)', borderBottom: '1px solid #ECEAE5' }}>
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Territories
        </button>

        {editing ? (
          <div className="space-y-2">
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
              style={{ borderColor: '#ECEAE5' }}
            />
            <div className="flex gap-2">
              <select
                value={editForm.type}
                onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value as TerritoryType }))}
                className="px-3 py-1.5 rounded-xl border bg-white text-xs focus:outline-none"
                style={{ borderColor: '#ECEAE5' }}
              >
                <option value="core_territory">Core Territory</option>
                <option value="expansion_zone">Expansion Zone</option>
                <option value="tactical_route">Tactical Route</option>
              </select>
              <button onClick={handleSaveEdit} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white" style={{ backgroundColor: '#6FAF8F' }}>Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{territory.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/door-knock?territory_id=${territory.id}&territory_name=${encodeURIComponent(territory.name)}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#6FAF8F' }}
              >
                <DoorOpen className="w-3.5 h-3.5" /> Door Knock
              </Link>
              <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1"><Home className="w-3 h-3" />{territory.property_count} properties</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{territory.owners_known} owners</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{territory.relationships_known} relationships</span>
          {territory.signal_count > 0 && (
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{territory.signal_count} signals</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.key ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
              style={tab === t.key ? { backgroundColor: '#6FAF8F' } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-4">
        {tab === 'overview' && <OverviewTab territory={territory} />}
        {tab === 'properties' && <PropertiesTab territoryId={id} onRefresh={fetchDetail} />}
        {tab === 'coverage' && <CoverageTab territoryId={id} />}
        {tab === 'programs' && <ProgramsTab territoryId={id} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════
function OverviewTab({ territory }: { territory: Territory }) {
  const [coverage, setCoverage] = useState<CoverageSummary | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadingCov, setLoadingCov] = useState(true);
  const [loadingSig, setLoadingSig] = useState(true);

  useEffect(() => {
    getTerritoryCoverage(territory.id)
      .then(setCoverage)
      .catch(() => {})
      .finally(() => setLoadingCov(false));
    getTerritorySignals(territory.id)
      .then(setSignals)
      .catch(() => setSignals([]))
      .finally(() => setLoadingSig(false));
  }, [territory.id]);

  return (
    <div className="space-y-4">
      {/* Coverage Summary */}
      <div className="relate-card p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Coverage Summary</h3>
        {loadingCov ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
        ) : coverage ? (
          <>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <StatTile label="Total" value={coverage.total_properties} />
              <StatTile label="Introduced" value={coverage.properties_introduced} color="#6FAF8F" />
              <StatTile label="Relationship" value={coverage.properties_with_relationship} color="#8BC4A6" />
              <StatTile label="Untouched" value={coverage.properties_untouched} color="#9CA3AF" />
            </div>
            {/* Horizontal coverage bar */}
            {coverage.total_properties > 0 && (
              <div className="h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: '#ECEAE5' }}>
                {coverage.properties_introduced > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${(coverage.properties_introduced / coverage.total_properties) * 100}%`,
                      backgroundColor: '#6FAF8F',
                    }}
                  />
                )}
                {coverage.properties_with_relationship > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${(coverage.properties_with_relationship / coverage.total_properties) * 100}%`,
                      backgroundColor: '#8BC4A6',
                    }}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400 italic py-2">No coverage data available</p>
        )}
      </div>

      {/* Signals */}
      <div className="relate-card p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Territory Signals</h3>
        {loadingSig ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
        ) : signals.length > 0 ? (
          <div className="space-y-2">
            {signals.slice(0, 5).map((s) => <SignalCard key={s.id} signal={s} />)}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-2">No signals detected for this territory</p>
        )}
      </div>

      {/* Map image */}
      {territory.map_image_url && (
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Territory Map</h3>
          <img src={territory.map_image_url} alt="Territory map" className="w-full rounded-xl" />
        </div>
      )}

      {/* Notes */}
      {territory.notes && (
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{territory.notes}</p>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold" style={{ color: color || '#374151' }}>{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PROPERTIES TAB
// ══════════════════════════════════════════════════════════
function PropertiesTab({ territoryId, onRefresh }: { territoryId: string; onRefresh: () => void }) {
  const [territory, setTerritory] = useState<any>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLink, setShowLink] = useState(false);
  const [search, setSearch] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    Promise.all([getTerritory(territoryId), getProperties()])
      .then(([t, props]) => { setTerritory(t); setAllProperties(props); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [territoryId]);

  const linkedProperties: any[] = territory?.properties || [];
  const linkedIds = new Set(linkedProperties.map((p: any) => String(p.id || p.property_id)));

  const filteredUnlinked = allProperties.filter(
    (p) => !linkedIds.has(String(p.id)) && p.address.toLowerCase().includes(search.toLowerCase())
  );

  async function handleLink(propertyId: number) {
    setLinking(true);
    try {
      await linkPropertyToTerritory(territoryId, String(propertyId));
      toast.success('Property linked');
      const t = await getTerritory(territoryId);
      setTerritory(t);
      onRefresh();
      setShowLink(false);
      setSearch('');
    } catch { toast.error('Failed to link'); }
    setLinking(false);
  }

  async function handleUnlink(propertyId: number | string) {
    try {
      await unlinkPropertyFromTerritory(territoryId, String(propertyId));
      toast.success('Property unlinked');
      const t = await getTerritory(territoryId);
      setTerritory(t);
      onRefresh();
    } catch { toast.error('Failed to unlink'); }
  }

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Linked Properties ({linkedProperties.length})
        </h3>
        <button
          onClick={() => setShowLink(!showLink)}
          className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#6FAF8F' }}
        >
          <Plus className="w-3.5 h-3.5" /> Link Property
        </button>
      </div>

      {showLink && (
        <div className="relate-card p-3 space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties by address…"
            className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
            style={{ borderColor: '#ECEAE5' }}
          />
          <div className="max-h-40 overflow-auto space-y-1">
            {filteredUnlinked.slice(0, 10).map((p) => (
              <button
                key={p.id}
                onClick={() => handleLink(p.id)}
                disabled={linking}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {p.address}{p.suburb ? `, ${p.suburb}` : ''}
              </button>
            ))}
            {filteredUnlinked.length === 0 && (
              <p className="text-xs text-gray-400 py-2 text-center">No matching properties</p>
            )}
          </div>
        </div>
      )}

      {linkedProperties.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-4 text-center">No properties linked yet</p>
      ) : (
        <div className="space-y-1">
          {linkedProperties.map((p: any) => (
            <div key={p.id || p.property_id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/60 border" style={{ borderColor: '#ECEAE5' }}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.address}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {p.suburb && <span className="text-xs text-gray-500">{p.suburb}</span>}
                  {p.sellability_score != null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      Sellability: {p.sellability_score}
                    </span>
                  )}
                  {p.last_listing_result && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {p.last_listing_result}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleUnlink(p.id || p.property_id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// COVERAGE TAB
// ══════════════════════════════════════════════════════════
function CoverageTab({ territoryId }: { territoryId: string }) {
  const [activities, setActivities] = useState<CoverageActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [logForm, setLogForm] = useState({ activity_type: 'territory_intro', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchActivities = useCallback(() => {
    setLoading(true);
    getTerritoryCoverage(territoryId)
      .then((c) => setActivities(c?.recent_activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [territoryId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  async function handleLog() {
    setSaving(true);
    try {
      await logCoverageActivity({
        territory_id: territoryId,
        activity_type: logForm.activity_type,
        notes: logForm.notes || undefined,
      });
      toast.success('Activity logged');
      setShowLog(false);
      setLogForm({ activity_type: 'territory_intro', notes: '' });
      fetchActivities();
    } catch { toast.error('Failed to log activity'); }
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coverage Activities</h3>
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#6FAF8F' }}
        >
          <Plus className="w-3.5 h-3.5" /> Log Activity
        </button>
      </div>

      {showLog && (
        <div className="relate-card p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Activity Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {ACTIVITY_TYPES.map((at) => (
                <button
                  key={at.value}
                  onClick={() => setLogForm((p) => ({ ...p, activity_type: at.value }))}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors border ${
                    logForm.activity_type === at.value
                      ? 'text-white border-transparent'
                      : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                  style={
                    logForm.activity_type === at.value
                      ? { backgroundColor: '#6FAF8F', borderColor: '#6FAF8F' }
                      : { borderColor: '#ECEAE5' }
                  }
                >
                  <at.icon className="w-3.5 h-3.5" />
                  {at.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={logForm.notes}
              onChange={(e) => setLogForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              placeholder="Optional notes…"
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 resize-none"
              style={{ borderColor: '#ECEAE5' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLog}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: '#6FAF8F' }}
            >
              {saving ? 'Logging…' : 'Log Activity'}
            </button>
            <button onClick={() => setShowLog(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
      ) : activities.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-8 text-center">No coverage activities logged yet</p>
      ) : (
        <div className="space-y-1">
          {activities.map((a) => {
            const atCfg = ACTIVITY_TYPES.find((t) => t.value === a.activity_type);
            const Icon = atCfg?.icon || Footprints;
            return (
              <div key={a.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-white/60 border" style={{ borderColor: '#ECEAE5' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(111,175,143,0.1)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#6FAF8F' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{atCfg?.label || a.activity_type}</p>
                  {a.notes && <p className="text-xs text-gray-500 mt-0.5">{a.notes}</p>}
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(a.completed_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PROGRAMS TAB
// ══════════════════════════════════════════════════════════
function ProgramsTab({ territoryId }: { territoryId: string }) {
  const [programs, setPrograms] = useState<FarmingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', recurrence: 'monthly', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchPrograms = useCallback(() => {
    setLoading(true);
    getTerritoryFarmingPrograms(territoryId)
      .then(setPrograms)
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, [territoryId]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  async function handleAdd() {
    if (!addForm.title.trim()) return;
    setSaving(true);
    try {
      await createFarmingProgram({
        territory_id: territoryId,
        title: addForm.title.trim(),
        recurrence: addForm.recurrence,
        notes: addForm.notes.trim() || undefined,
      });
      toast.success('Program created');
      setShowAdd(false);
      setAddForm({ title: '', recurrence: 'monthly', notes: '' });
      fetchPrograms();
    } catch { toast.error('Failed to create program'); }
    setSaving(false);
  }

  async function handleMarkComplete(program: FarmingProgram) {
    const now = new Date().toISOString();
    let nextDue: string | undefined;
    const recurrence = program.recurrence?.toLowerCase();
    if (recurrence === 'weekly') {
      nextDue = new Date(Date.now() + 7 * 86400000).toISOString();
    } else if (recurrence === 'fortnightly') {
      nextDue = new Date(Date.now() + 14 * 86400000).toISOString();
    } else if (recurrence === 'monthly') {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      nextDue = d.toISOString();
    } else if (recurrence === 'quarterly') {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      nextDue = d.toISOString();
    }
    try {
      await updateFarmingProgram(program.id, {
        last_completed_date: now,
        next_due_date: nextDue,
      });
      toast.success('Marked complete');
      fetchPrograms();
    } catch { toast.error('Failed to update'); }
  }

  async function handleDeleteProgram(id: string) {
    try {
      await deleteFarmingProgram(id);
      toast.success('Program deleted');
      fetchPrograms();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Farming Programs</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#6FAF8F' }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Program
        </button>
      </div>

      {showAdd && (
        <div className="relate-card p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={addForm.title}
              onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Monthly market update flyer"
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
              style={{ borderColor: '#ECEAE5' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Recurrence</label>
            <select
              value={addForm.recurrence}
              onChange={(e) => setAddForm((p) => ({ ...p, recurrence: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none"
              style={{ borderColor: '#ECEAE5' }}
            >
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={addForm.notes}
              onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 resize-none"
              style={{ borderColor: '#ECEAE5' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!addForm.title.trim() || saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: '#6FAF8F' }}
            >
              {saving ? 'Creating…' : 'Create Program'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
      ) : programs.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-8 text-center">No farming programs yet</p>
      ) : (
        <div className="space-y-2">
          {programs.map((p) => {
            const overdue = isOverdue(p.next_due_date);
            return (
              <div key={p.id} className="relate-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{p.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100">{p.recurrence}</span>
                      {p.next_due_date && (
                        <span className={overdue ? 'text-amber-600 font-medium' : ''}>
                          Next: {formatDate(p.next_due_date)}
                        </span>
                      )}
                      {p.last_completed_date && (
                        <span>Last: {formatDate(p.last_completed_date)}</span>
                      )}
                    </div>
                    {p.notes && <p className="text-xs text-gray-400 mt-1">{p.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMarkComplete(p)}
                      className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                      title="Mark complete"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(p.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CREATE TERRITORY MODAL
// ══════════════════════════════════════════════════════════
function CreateTerritoryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    type: 'core_territory' as TerritoryType,
    notes: '',
  });
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [boundaryPoints, setBoundaryPoints] = useState<{ x: number; y: number }[]>([]);
  const [boundaryClosed, setBoundaryClosed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMapImage(reader.result as string);
      setBoundaryPoints([]);
      setBoundaryClosed(false);
    };
    reader.readAsDataURL(file);
  }

  // Draw boundary on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !mapImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (boundaryPoints.length === 0) return;

    ctx.strokeStyle = '#6FAF8F';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(111, 175, 143, 0.15)';

    ctx.beginPath();
    boundaryPoints.forEach((pt, i) => {
      const px = (pt.x / 100) * canvas.width;
      const py = (pt.y / 100) * canvas.height;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });

    if (boundaryClosed) {
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();

    // Draw points
    boundaryPoints.forEach((pt, i) => {
      const px = (pt.x / 100) * canvas.width;
      const py = (pt.y / 100) * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, i === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#6FAF8F' : 'rgba(111,175,143,0.7)';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [boundaryPoints, boundaryClosed, mapImage]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (boundaryClosed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Close polygon if clicking near first point
    if (boundaryPoints.length >= 3) {
      const first = boundaryPoints[0];
      const dist = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2);
      if (dist < 3) {
        setBoundaryClosed(true);
        return;
      }
    }

    setBoundaryPoints((prev) => [...prev, { x, y }]);
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createTerritory({
        name: form.name.trim(),
        type: form.type,
        notes: form.notes.trim() || undefined,
        map_image_url: mapImage || undefined,
        boundary_data: boundaryPoints.length > 0 ? boundaryPoints : undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err?.message || 'Failed to create territory');
    }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-lg overflow-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Add Territory</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Remuera Core"
            className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <div className="flex gap-2">
            {(['core_territory', 'expansion_zone', 'tactical_route'] as TerritoryType[]).map((t) => {
              const cfg = TYPE_CONFIG[t];
              const selected = form.type === t;
              return (
                <button
                  key={t}
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    selected ? 'text-white border-transparent' : `${cfg.color} bg-white`
                  }`}
                  style={
                    selected
                      ? { backgroundColor: t === 'core_territory' ? '#6FAF8F' : t === 'expansion_zone' ? '#D97706' : '#3B82F6', borderColor: 'transparent' }
                      : { borderColor: '#ECEAE5' }
                  }
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={3}
            placeholder="Territory notes…"
            className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 resize-none"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        {/* Map Image Upload */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Map Image</label>
          <p className="text-[10px] text-gray-400 mb-2">Upload a screenshot of your farming area</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200"
          />
        </div>

        {/* Canvas Boundary Drawing */}
        {mapImage && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Draw Boundary</label>
              <div className="flex gap-2">
                {!boundaryClosed && boundaryPoints.length >= 3 && (
                  <button
                    onClick={() => setBoundaryClosed(true)}
                    className="text-[10px] font-medium px-2 py-1 rounded-lg"
                    style={{ color: '#6FAF8F', backgroundColor: 'rgba(111,175,143,0.1)' }}
                  >
                    Close Boundary
                  </button>
                )}
                {boundaryPoints.length > 0 && (
                  <button
                    onClick={() => { setBoundaryPoints([]); setBoundaryClosed(false); }}
                    className="text-[10px] font-medium px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mb-1">
              {boundaryClosed
                ? 'Boundary drawn. Clear to redraw.'
                : 'Click to place points. Click near the first point or press "Close Boundary" to complete.'}
            </p>
            <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: '#ECEAE5' }}>
              <img
                ref={imgRef}
                src={mapImage}
                alt="Territory map"
                className="w-full block"
                onLoad={() => {
                  // Trigger canvas resize
                  setBoundaryPoints((p) => [...p]);
                }}
              />
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                style={{ cursor: boundaryClosed ? 'default' : 'crosshair' }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-colors hover:opacity-90"
            style={{ backgroundColor: '#6FAF8F' }}
          >
            {saving ? 'Creating…' : 'Create Territory'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
