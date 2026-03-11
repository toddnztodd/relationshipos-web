import { useState, useEffect, useCallback } from 'react';
import { getCommunityEntities, createCommunityEntity } from '@/lib/api';
import type { CommunityEntity, CommunityEntityCreate } from '@/types';
import { personDisplayName } from '@/types';
import { Loader2, Building2, MapPin, ArrowLeft, Users, Home, Plus, X } from 'lucide-react';

const ENTITY_TYPES = ['school', 'sports_club', 'church', 'business', 'community_group', 'other'] as const;

export default function Community() {
  const [entities, setEntities] = useState<CommunityEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CommunityEntity | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchEntities = useCallback(() => {
    setLoading(true);
    getCommunityEntities()
      .then(setEntities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  if (selected) {
    return (
      <div className="h-full overflow-auto">
        <div
          className="sticky top-0 backdrop-blur-sm px-6 py-4 z-10"
          style={{ background: 'rgba(248,247,244,0.9)', borderBottom: '1px solid #ECEAE5' }}
        >
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Community
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              {selected.type}
            </span>
            {selected.location && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {selected.location}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {selected.notes && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{selected.notes}</p>
            </div>
          )}

          {selected.people.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                People ({selected.people.length})
              </h3>
              <div className="space-y-1">
                {selected.people.map((p) => (
                  <div key={p.person_id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{personDisplayName(p)}</p>
                      {p.role && <p className="text-xs text-gray-500">{p.role}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.properties.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Properties ({selected.properties.length})
              </h3>
              <div className="space-y-1">
                {selected.properties.map((p) => (
                  <div key={p.property_id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <Home className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{p.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <AddCommunityForm
        onClose={() => setShowAddForm(false)}
        onCreated={() => {
          setShowAddForm(false);
          fetchEntities();
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Community</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {entities.length} entit{entities.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#6FAF8F' }}
        >
          <Plus className="w-4 h-4" />
          Add Community
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : entities.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No community entities yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: '#6FAF8F' }}
          >
            Add your first community
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {entities.map((entity) => (
            <button
              key={entity.id}
              onClick={() => setSelected(entity)}
              className="w-full text-left px-4 py-3 rounded-xl border bg-white/60 border-transparent hover:bg-white hover:border-gray-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{entity.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-medium">
                      {entity.type}
                    </span>
                    {entity.location && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {entity.location}
                      </span>
                    )}
                    {entity.people.length > 0 && (
                      <span className="text-xs text-gray-400">{entity.people.length} people</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Community Form ──
function AddCommunityForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    type: 'community_group',
    location: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createCommunityEntity({
        name: form.name.trim(),
        type: form.type,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined,
      } as CommunityEntityCreate);
      onCreated();
    } catch (err: any) {
      setError(err?.message || 'Failed to create community');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Add Community</h2>
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
            onChange={set('name')}
            placeholder="e.g. Remuera Primary School"
            className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={form.type}
            onChange={set('type')}
            className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
            style={{ borderColor: '#ECEAE5' }}
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={set('location')}
            placeholder="e.g. Remuera, Auckland"
            className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Any notes about this community..."
            className="w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 resize-none"
            style={{ borderColor: '#ECEAE5' }}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-colors hover:opacity-90"
            style={{ backgroundColor: '#6FAF8F' }}
          >
            {saving ? 'Creating…' : 'Create Community'}
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
