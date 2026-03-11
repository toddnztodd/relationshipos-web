import { useState, useMemo } from 'react';
import { usePeople } from '@/hooks/usePeople';
import { PersonCard } from '@/components/people/PersonCard';
import { PersonDetailPanel } from '@/components/people/PersonDetailPanel';
import { Search, Users, Loader2 } from 'lucide-react';
import type { Person, Tier } from '@/types';
import { personDisplayName } from '@/types';

const TIERS: (Tier | 'all')[] = ['all', 'A', 'B', 'C'];

export default function People() {
  const { data: people = [], isLoading, error } = usePeople();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

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

  if (selectedPerson) {
    return (
      <PersonDetailPanel
        person={selectedPerson}
        onBack={() => setSelectedPerson(null)}
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
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onClick={() => setSelectedPerson(person)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
