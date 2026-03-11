import { useState, useMemo, useCallback } from 'react';
import { usePeople, useCreatePerson, useRestoreContact, useCheckDuplicate } from '@/hooks/usePeople';
import { PersonCard } from '@/components/people/PersonCard';
import { PersonDetailPanel } from '@/components/people/PersonDetailPanel';
import { VaultDialog } from '@/components/people/VaultDialog';
import { BulkVaultDialog } from '@/components/people/BulkVaultDialog';
import { ContactReappearancePrompt } from '@/components/people/ContactReappearancePrompt';
import { Search, Users, Loader2, Plus, CheckSquare, X, Archive } from 'lucide-react';
import type { Person, Tier, PersonCreate } from '@/types';
import { personDisplayName } from '@/types';

const TIERS: (Tier | 'all')[] = ['all', 'A', 'B', 'C'];

export default function People() {
  const { data: people = [], isLoading, error } = usePeople();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">People</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {people.length} contact{people.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!selectionMode ? (
            <>
              <button
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Select
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Contact
              </button>
            </>
          ) : (
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                tierFilter === t
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {search || tierFilter !== 'all' ? 'No matching contacts' : 'No contacts yet'}
          </p>
          {!search && tierFilter === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Add your first contact
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              selectionMode={selectionMode}
              isChecked={selectedIds.has(person.id)}
              onToggleCheck={toggleCheck}
              onClick={() => !selectionMode && setSelectedPerson(person)}
              onDelete={(p) => setVaultTarget(p)}
            />
          ))}
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
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              value={form.last_name ?? ''}
              onChange={(e) => updateField('last_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
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
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
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
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Suburb</label>
          <input
            type="text"
            value={form.suburb ?? ''}
            onChange={(e) => updateField('suburb', e.target.value)}
            placeholder="e.g. Ponsonby"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Any notes about this contact…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors resize-none"
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
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Add Contact
        </button>
      </form>
    </div>
  );
}
