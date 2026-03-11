import { useState, useMemo } from 'react';
import { useProperties, usePropertyBuyerInterest, usePropertyOwners } from '@/hooks/useProperties';
import { usePropertySignals } from '@/hooks/useSignals';
import { SignalCard } from '@/components/shared/SignalCard';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import type { Property } from '@/types';
import { Search, Home, Loader2, ArrowLeft, MapPin, Bed, Bath, DollarSign, Tag, Users } from 'lucide-react';

export default function Properties() {
  const { data: properties = [], isLoading, error } = useProperties();
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const q = search.toLowerCase();
    return properties.filter(
      (p) =>
        p.address.toLowerCase().includes(q) ||
        p.suburb?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
    );
  }, [properties, search]);

  if (selectedProperty) {
    return (
      <PropertyDetailPanel
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search properties…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
          style={{ borderColor: '#ECEAE5' }}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm text-red-500">Failed to load properties</p>
          <p className="text-xs text-gray-400 mt-1">The backend may be starting up — try again in a moment</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {search ? 'No matching properties' : 'No properties yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => setSelectedProperty(property)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Property Card ──
function PropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relate-card w-full text-left px-4 py-3 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.10)' }}>
          <Home className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{property.address}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {property.suburb && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {property.suburb}
              </span>
            )}
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed className="w-3 h-3" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {property.bathrooms}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            {property.estimated_value != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${(property.estimated_value / 1000).toFixed(0)}k est.
              </span>
            )}
            {property.sellability_label && (
              <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">
                {property.sellability_label}
              </span>
            )}
            {property.appraisal_stage && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'rgba(111,175,143,0.12)', color: '#4a8a6a' }}>
                {property.appraisal_stage}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Property Detail Panel ──
function PropertyDetailPanel({ property, onBack }: { property: Property; onBack: () => void }) {
  const { data: buyers = [] } = usePropertyBuyerInterest(property.id);
  const { data: owners = [] } = usePropertyOwners(property.id);
  const { data: signals = [] } = usePropertySignals(property.id);

  return (
    <div className="h-full overflow-auto">
      <div className="sticky top-0 backdrop-blur-sm px-6 py-4 z-10" style={{ background: 'rgba(248,247,244,0.9)', borderBottom: '1px solid #ECEAE5' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Properties
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{property.address}</h2>
        {property.suburb && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {property.suburb}{property.city ? `, ${property.city}` : ''}
          </p>
        )}
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Property Intelligence */}
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Property Intelligence</h3>
          <div className="grid grid-cols-2 gap-3">
            {property.bedrooms != null && (
              <InfoTile icon={Bed} label="Bedrooms" value={String(property.bedrooms)} />
            )}
            {property.bathrooms != null && (
              <InfoTile icon={Bath} label="Bathrooms" value={String(property.bathrooms)} />
            )}
            {property.estimated_value != null && (
              <InfoTile icon={DollarSign} label="Estimated Value" value={`$${property.estimated_value.toLocaleString()}`} />
            )}
            {property.council_valuation != null && (
              <InfoTile icon={DollarSign} label="Council Valuation" value={`$${property.council_valuation.toLocaleString()}`} />
            )}
            {property.land_area != null && (
              <InfoTile icon={MapPin} label="Land Area" value={`${property.land_area}m²`} />
            )}
            {property.floor_area != null && (
              <InfoTile icon={Home} label="Floor Area" value={`${property.floor_area}m²`} />
            )}
          </div>
        </div>

        {/* Sellability */}
        {property.sellability_score != null && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sellability</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {property.sellability_label || 'Score'}
              </span>
              <span className="text-xs text-gray-500">{Math.round(property.sellability_score * 100)}%</span>
            </div>
            <ConfidenceBar value={property.sellability_score} />
          </div>
        )}

        {/* Owners */}
        {owners.length > 0 && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Owners</h3>
            <div className="space-y-1">
              {owners.map((o) => (
                <div key={o.person_id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(111,175,143,0.06)' }}>
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {[o.first_name, o.last_name].filter(Boolean).join(' ')}
                    </p>
                    {o.role && <p className="text-xs text-gray-500">{o.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer Interest */}
        {buyers.length > 0 && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Buyer Interest</h3>
            <div className="space-y-1">
              {buyers.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.person_name || `Person #${b.person_id}`}</p>
                    {b.notes && <p className="text-xs text-gray-500 mt-0.5">{b.notes}</p>}
                  </div>
                  {b.interest_level != null && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className="w-1.5 h-4 rounded-full"
                          style={{ backgroundColor: n <= b.interest_level! ? '#6FAF8F' : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signals */}
        <div className="relate-card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Signals</h3>
          {signals.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No signals detected</p>
          ) : (
            <div className="space-y-2">
              {signals.map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {property.notes && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{property.notes}</p>
          </div>
        )}

        {/* Tags */}
        {property.tags && property.tags.length > 0 && (
          <div className="relate-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {property.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Info Tile ──
function InfoTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(111,175,143,0.06)', border: '1px solid #ECEAE5' }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3 h-3 text-gray-400" />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
