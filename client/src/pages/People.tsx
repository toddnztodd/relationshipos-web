import { useState, useMemo, useCallback } from 'react';
import {
  usePeople, useCreatePerson, useRestoreContact, useCheckDuplicate,
  useVaultedContacts, usePrivateContacts,
} from '@/hooks/usePeople';
import { PersonCard } from '@/components/people/PersonCard';
import { PersonDetailPanel } from '@/components/people/PersonDetailPanel';
import { VaultDialog } from '@/components/people/VaultDialog';
import { BulkVaultDialog } from '@/components/people/BulkVaultDialog';
import { ContactReappearancePrompt } from '@/components/people/ContactReappearancePrompt';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { Search, Users, Loader2, Plus, CheckSquare, X, Archive, RotateCcw, ShieldCheck } from 'lucide-react';
import type { Person, Tier, PersonCreate } from '@/types';
import { personDisplayName } from '@/types';

const TIERS: (Tier | 'all')[] = ['all', 'A', 'B', 'C'];
type PeopleTab = 'contacts' | 'vault' | 'private';

export default function People() {
  const { data: people = [], isLoading, error } = usePeople();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState<PeopleTab>('contacts');

  // Vault dialog state
  const [vaultTarget, setVaultTarget] = useState<Person | null>(null);

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkVaultOpen, setBulkVaultOpen] = useState(false);

  // Add contact form state
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = useMemo(() => {
    let list = people;
    if (tierFilter !== 'all') {
      list = list.filter((p) => p.tier === tierFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          personDisplayName(p).toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      );
    }
    return list;
  }, [people, search, tierFilter]);

  const toggleCheck = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const selectedNames = useMemo(() => {
    return people
      .filter((p) => selectedIds.has(p.id))
      .map((p) => personDisplayName(p));
  }, [people, selectedIds]);

  // Person detail view
  if (selectedPerson) {
    return (
      <PersonDetailPanel
        person={selectedPerson}
        onBack={() => setSelectedPerson(null)}
      />
    );
  }

  // Add contact form view
  if (showAddForm) {
    return (
      <AddContactForm
        onClose={() => setShowAddForm(false)}
        onCreated={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">People</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {people.length} contact{people.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'contacts' && !selectionMode ? (
            <>
              <button
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 border bg-white hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#ECEAE5' }}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Select
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#6FAF8F' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Contact
              </button>
            </>
          ) : activeTab === 'contacts' && selectionMode ? (
            <>
              <span className="text-xs text-gray-500">
                {selectedIds.size} selected
              </span>
              {selectedIds.size > 0 && (
                <button
                  onClick={() => setBulkVaultOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Vault selected
                </button>
              )}
              <button
                onClick={exitSelectionMode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 border bg-white hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#ECEAE5' }}
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 p-0.5 rounded-lg bg-gray-100 w-fit">
        {(['contacts', 'vault', 'private'] as PeopleTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'contacts') exitSelectionMode();
            }}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize"
            style={
              activeTab === tab
                ? { backgroundColor: '#6FAF8F', color: 'white' }
                : { color: '#6b7280' }
            }
          >
            {tab === 'contacts' ? 'Contacts' : tab === 'vault' ? 'Vault' : 'Private'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'contacts' && (
        <ContactsTab
          people={filtered}
          isLoading={isLoading}
          error={error}
          search={search}
          setSearch={setSearch}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          toggleCheck={toggleCheck}
          onSelectPerson={setSelectedPerson}
          onVaultTarget={setVaultTarget}
          onShowAddForm={() => setShowAddForm(true)}
        />
      )}
      {activeTab === 'vault' && <VaultTab />}
      {activeTab === 'private' && <PrivateTab />}

      {/* Bulk action bar */}
      {selectionMode && selectedIds.size > 0 && activeTab === 'contacts' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-xl bg-amber-50 border border-amber-200 shadow-lg flex items-center gap-4">
          <span className="text-sm text-amber-800 font-medium">
            {selectedIds.size} contact{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => setBulkVaultOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            Vault selected
          </button>
        </div>
      )}

      {/* Vault Dialog */}
      {vaultTarget && (
        <VaultDialog
          person={vaultTarget}
          open={!!vaultTarget}
          onClose={() => setVaultTarget(null)}
          onVaulted={() => setVaultTarget(null)}
          onPrivate={() => setVaultTarget(null)}
          onDeleted={() => setVaultTarget(null)}
        />
      )}

      {/* Bulk Vault Dialog */}
      <BulkVaultDialog
        personIds={Array.from(selectedIds)}
        personNames={selectedNames}
        open={bulkVaultOpen}
        onClose={() => setBulkVaultOpen(false)}
        onVaulted={() => {
          setBulkVaultOpen(false);
          exitSelectionMode();
        }}
      />
    </div>
  );
}

// ── Contacts Tab ──

function ContactsTab({
  people,
  isLoading,
  error,
  search,
  setSearch,
  tierFilter,
  setTierFilter,
  selectionMode,
  selectedIds,
  toggleCheck,
  onSelectPerson,
  onVaultTarget,
  onShowAddForm,
}: {
  people: Person[];
  isLoading: boolean;
  error: Error | null;
  search: string;
  setSearch: (s: string) => void;
  tierFilter: Tier | 'all';
  setTierFilter: (t: Tier | 'all') => void;
  selectionMode: boolean;
  selectedIds: Set<number>;
  toggleCheck: (id: number) => void;
  onSelectPerson: (p: Person) => void;
  onVaultTarget: (p: Person) => void;
  onShowAddForm: () => void;
}) {
  return (
    <>
      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>
        <div className="flex items-center gap-1 bg-white border rounded-lg p-0.5" style={{ borderColor: '#ECEAE5' }}>
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              style={
                tierFilter === t
                  ? { backgroundColor: 'rgba(111,175,143,0.15)', color: '#4a8a6a' }
                  : { color: '#6b7280' }
              }
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm text-red-500">Failed to load contacts</p>
          <p className="text-xs text-gray-400 mt-1">The backend may be starting up — try again in a moment</p>
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {search || tierFilter !== 'all' ? 'No matching contacts' : 'No contacts yet'}
          </p>
          {!search && tierFilter === 'all' && (
            <button
              onClick={onShowAddForm}
              className="mt-3 text-sm font-medium"
              style={{ color: '#6FAF8F' }}
            >
              Add your first contact
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              selectionMode={selectionMode}
              isChecked={selectedIds.has(person.id)}
              onToggleCheck={toggleCheck}
              onClick={() => !selectionMode && onSelectPerson(person)}
              onDelete={(p) => onVaultTarget(p)}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ── Vault Tab ──

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const months = Math.floor(d / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

function VaultTab() {
  const { data: vaulted = [], isLoading } = useVaultedContacts();
  const restoreMutation = useRestoreContact();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (vaulted.length === 0) {
    return (
      <div className="text-center py-20">
        <Archive className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">No vaulted contacts</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
          When you vault a contact, they're removed from your active CRM but their identity is kept in memory — so they can be recognised if they return.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {vaulted.map((person) => {
        const displayName = personDisplayName(person);
        return (
          <div
            key={person.id}
            className="relate-card px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-sm font-semibold text-amber-600 shrink-0">
                {person.first_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                  {person.phone && <span>{person.phone}</span>}
                  {person.email && <span className="truncate">{person.email}</span>}
                </div>
                {(person as any).vault_note && (
                  <p className="text-xs text-gray-400 italic mt-0.5 truncate">
                    {(person as any).vault_note}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Vaulted {timeAgo(person.updated_at)}
                </p>
              </div>
            </div>
            <button
              onClick={() => restoreMutation.mutate(person.id)}
              disabled={restoreMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ml-3"
              style={{ backgroundColor: 'rgba(111,175,143,0.12)', color: '#4a8a6a' }}
            >
              <RotateCcw className="w-3 h-3" />
              Restore
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Private Tab ──

function PrivateTab() {
  const { data: privateContacts = [], isLoading } = usePrivateContacts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (privateContacts.length === 0) {
    return (
      <div className="text-center py-20">
        <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">No private contacts</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
          Private contacts are kept in your CRM but excluded from signals, briefing, and buyer matching.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {privateContacts.map((person) => {
        const displayName = personDisplayName(person);
        return (
          <div
            key={person.id}
            className="relate-card px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-semibold text-blue-600 shrink-0">
                {person.first_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                    Private
                  </span>
                  <HealthBadge status={person.health_status} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                  {person.phone && <span>{person.phone}</span>}
                  {person.email && <span className="truncate">{person.email}</span>}
                </div>
                {person.suburb && (
                  <p className="text-xs text-gray-400 mt-0.5">{person.suburb}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Add Contact Form ──

function AddContactForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const createPerson = useCreatePerson();
  const restoreMutation = useRestoreContact();
  const checkDup = useCheckDuplicate();

  const [form, setForm] = useState<Partial<PersonCreate>>({
    first_name: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Duplicate detection state
  const [dupMatch, setDupMatch] = useState<Person | null>(null);
  const [dupMatchType, setDupMatchType] = useState<'phone' | 'email' | 'name' | null>(null);
  const [dupDismissed, setDupDismissed] = useState(false);

  function updateField(field: keyof PersonCreate, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhoneBlur() {
    if (!form.phone?.trim() || dupDismissed) return;
    try {
      const result = await checkDup.mutateAsync({ phone: form.phone.trim() });
      if (result.match) {
        setDupMatch(result.match);
        setDupMatchType(result.match_type);
      }
    } catch {
      // Silently ignore
    }
  }

  async function handleEmailBlur() {
    if (!form.email?.trim() || dupDismissed) return;
    try {
      const result = await checkDup.mutateAsync({ email: form.email.trim() });
      if (result.match) {
        setDupMatch(result.match);
        setDupMatchType(result.match_type);
      }
    } catch {
      // Silently ignore
    }
  }

  async function handleRestore() {
    if (!dupMatch) return;
    try {
      await restoreMutation.mutateAsync(dupMatch.id);
      onCreated();
    } catch {
      // Error handled by mutation
    }
  }

  function handleKeepSeparate() {
    setDupMatch(null);
    setDupMatchType(null);
    setDupDismissed(true);
  }

  function handleIgnore() {
    setDupMatch(null);
    setDupMatchType(null);
    setDupDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name?.trim() || !form.phone?.trim()) return;
    setSubmitting(true);
    try {
      await createPerson.mutateAsync({
        first_name: form.first_name.trim(),
        phone: form.phone.trim(),
        last_name: form.last_name?.trim() || null,
        email: form.email?.trim() || null,
        suburb: form.suburb?.trim() || null,
        notes: form.notes?.trim() || null,
      });
      onCreated();
    } catch {
      // Error handled by mutation
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-4"
      >
        <X className="w-3.5 h-3.5" />
        Cancel
      </button>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Add Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
            <input
              type="text"
              value={form.first_name ?? ''}
              onChange={(e) => updateField('first_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors"
              style={{ borderColor: '#ECEAE5' }}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              value={form.last_name ?? ''}
              onChange={(e) => updateField('last_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors"
              style={{ borderColor: '#ECEAE5' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={(e) => updateField('phone', e.target.value)}
            onBlur={handlePhoneBlur}
            placeholder="+64 21 123 4567"
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors"
            style={{ borderColor: '#ECEAE5' }}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="name@example.com"
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Suburb</label>
          <input
            type="text"
            value={form.suburb ?? ''}
            onChange={(e) => updateField('suburb', e.target.value)}
            placeholder="e.g. Ponsonby"
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Any notes about this contact…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors resize-none"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        {/* Duplicate detection prompt */}
        {dupMatch && dupMatchType && !dupDismissed && (
          <ContactReappearancePrompt
            match={dupMatch}
            matchType={dupMatchType}
            onRestore={handleRestore}
            onKeepSeparate={handleKeepSeparate}
            onIgnore={handleIgnore}
          />
        )}

        <button
          type="submit"
          disabled={submitting || !form.first_name?.trim() || !form.phone?.trim()}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#6FAF8F' }}
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Add Contact
        </button>
      </form>
    </div>
  );
}
