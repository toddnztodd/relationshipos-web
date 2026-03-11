import { useState, useEffect } from 'react';
import { getCommunityEntities } from '@/lib/api';
import type { CommunityEntity } from '@/types';
import { personDisplayName } from '@/types';
import { Loader2, Building2, MapPin, ArrowLeft, Users, Home } from 'lucide-react';

export default function Community() {
  const [entities, setEntities] = useState<CommunityEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CommunityEntity | null>(null);

  useEffect(() => {
    getCommunityEntities()
      .then(setEntities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <div className="h-full overflow-auto">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 z-10">
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

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Community</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {entities.length} entit{entities.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : entities.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No community entities yet</p>
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
