import { useState, useMemo } from 'react';
import { useProperties, usePropertyBuyerInterest, usePropertyOwners } from '@/hooks/useProperties';
import { usePropertySignals } from '@/hooks/useSignals';
import { SignalCard } from '@/components/shared/SignalCard';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import type { Property } from '@/types';
import { Search, Home, Loader2, ArrowLeft, MapPin, Bed, Bath, DollarSign, Tag, Users, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useCreateProperty } from '@/hooks/useProperties';
import { VoiceRecorder } from '@/components/shared/VoiceRecorder';
import { ListingChecklist } from '@/components/properties/ListingChecklist';
import type { PropertyCreate } from '@/types';

export default function Properties() {
  const { data: properties = [], isLoading, error } = useProperties();
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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

  if (showAddForm) {
    return (
      <AddPropertyForm
        onClose={() => setShowAddForm(false)}
        onCreated={() => setShowAddForm(false)}
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
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#6FAF8F' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Property
        </button>
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

        {/* Listing Checklist */}
        <ListingChecklist propertyId={property.id} propertyAddress={property.address} />

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

// ── Add Property Form ──
const LISTING_HISTORY_FIELDS = [
  'cv', 'last_sold_amount', 'last_sold_date', 'current_listing_price',
  'listing_url', 'listing_agent', 'listing_agency', 'last_listed_date',
  'last_listing_result', 'sellability', 'notes',
];

function AddPropertyForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const createProp = useCreateProperty();
  const [form, setForm] = useState<Record<string, string>>({
    address: '',
    suburb: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    property_type: '',
    estimated_value: '',
    land_area: '',
    // Listing History & Intelligence
    cv: '',
    last_sold_amount: '',
    last_sold_date: '',
    current_listing_price: '',
    listing_url: '',
    listing_agent: '',
    listing_agency: '',
    last_listed_date: '',
    last_listing_result: '',
    sellability: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors';
  const borderStyle = { borderColor: '#ECEAE5' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address.trim()) return;
    setSubmitting(true);
    try {
      const payload: PropertyCreate = {
        address: form.address.trim(),
        suburb: form.suburb?.trim() || null,
        city: form.city?.trim() || null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        property_type: form.property_type?.trim() || null,
        notes: form.notes?.trim() || null,
        estimated_value: form.estimated_value
          ? Number(form.estimated_value.replace(/[^0-9.]/g, ''))
          : form.cv
          ? Number(form.cv.replace(/[^0-9.]/g, ''))
          : null,
      };
      await createProp.mutateAsync(payload);
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
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Add Property</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voice Fill */}
        <VoiceRecorder
          parseEndpoint="/api/v1/properties/parse-voice"
          label="Speak to fill"
          onTranscript={() => {}}
          onParsed={(data: any) => {
            // Core fields
            if (data.address) updateField('address', data.address);
            if (data.suburb) updateField('suburb', data.suburb);
            if (data.city) updateField('city', data.city);
            if (data.bedrooms !== undefined && data.bedrooms !== null) updateField('bedrooms', String(data.bedrooms));
            if (data.bathrooms !== undefined && data.bathrooms !== null) updateField('bathrooms', String(data.bathrooms));
            if (data.land_area || data.land_size) updateField('land_area', data.land_area || data.land_size);
            if (data.property_type) updateField('property_type', data.property_type);
            if (data.estimated_value || data.cv) updateField('estimated_value', data.estimated_value || data.cv);
            // Extended Listing History fields
            const hasHistoryData = LISTING_HISTORY_FIELDS.some(
              (f) => data[f] !== undefined && data[f] !== null && data[f] !== ''
            );
            if (data.cv) updateField('cv', data.cv);
            if (data.last_sold_amount) updateField('last_sold_amount', String(data.last_sold_amount));
            if (data.last_sold_date) updateField('last_sold_date', data.last_sold_date);
            if (data.current_listing_price) updateField('current_listing_price', String(data.current_listing_price));
            if (data.listing_url) updateField('listing_url', data.listing_url);
            if (data.listing_agent) updateField('listing_agent', data.listing_agent);
            if (data.listing_agency) updateField('listing_agency', data.listing_agency);
            if (data.last_listed_date) updateField('last_listed_date', data.last_listed_date);
            if (data.last_listing_result) updateField('last_listing_result', data.last_listing_result);
            if (data.sellability !== undefined && data.sellability !== null) updateField('sellability', String(data.sellability));
            if (data.notes) updateField('notes', data.notes);
            // Auto-expand history section if any history fields were populated
            if (hasHistoryData) setHistoryExpanded(true);
          }}
        />

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="e.g. 42 Queen Street"
            className={inputCls}
            style={borderStyle}
            required
          />
        </div>

        {/* Suburb + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Suburb</label>
            <input type="text" value={form.suburb} onChange={(e) => updateField('suburb', e.target.value)} placeholder="e.g. Ponsonby" className={inputCls} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
            <input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="e.g. Auckland" className={inputCls} style={borderStyle} />
          </div>
        </div>

        {/* Beds / Baths / Land */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bedrooms</label>
            <input type="number" value={form.bedrooms} onChange={(e) => updateField('bedrooms', e.target.value)} min="0" className={inputCls} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bathrooms</label>
            <input type="number" value={form.bathrooms} onChange={(e) => updateField('bathrooms', e.target.value)} min="0" className={inputCls} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Land Area</label>
            <input type="text" value={form.land_area} onChange={(e) => updateField('land_area', e.target.value)} placeholder="m²" className={inputCls} style={borderStyle} />
          </div>
        </div>

        {/* Property Type + Estimated Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
            <input type="text" value={form.property_type} onChange={(e) => updateField('property_type', e.target.value)} placeholder="e.g. House, Apartment" className={inputCls} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Value</label>
            <input type="text" value={form.estimated_value} onChange={(e) => updateField('estimated_value', e.target.value)} placeholder="$1,200,000" className={inputCls} style={borderStyle} />
          </div>
        </div>

        {/* ── Listing History & Intelligence (collapsible) ── */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #ECEAE5' }}>
          <button
            type="button"
            onClick={() => setHistoryExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Listing History &amp; Intelligence
            </span>
            {historyExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronRight className="w-4 h-4 text-gray-400" />
            }
          </button>

          {historyExpanded && (
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #ECEAE5' }}>
              <div className="pt-3" />

              {/* CV / Estimated Value */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CV / Estimated Value</label>
                <input type="text" value={form.cv} onChange={(e) => updateField('cv', e.target.value)} placeholder="$1,200,000" className={inputCls} style={borderStyle} />
              </div>

              {/* Last Sold Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Sold Amount</label>
                  <input type="number" value={form.last_sold_amount} onChange={(e) => updateField('last_sold_amount', e.target.value)} placeholder="e.g. 950000" className={inputCls} style={borderStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Sold Date</label>
                  <input type="date" value={form.last_sold_date} onChange={(e) => updateField('last_sold_date', e.target.value)} className={inputCls} style={borderStyle} />
                </div>
              </div>

              {/* Current Listing Price */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Listing Price</label>
                <input type="number" value={form.current_listing_price} onChange={(e) => updateField('current_listing_price', e.target.value)} placeholder="e.g. 1100000" className={inputCls} style={borderStyle} />
              </div>

              {/* Listing URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Listing URL</label>
                <input type="url" value={form.listing_url} onChange={(e) => updateField('listing_url', e.target.value)} placeholder="https://www.trademe.co.nz/…" className={inputCls} style={borderStyle} />
              </div>

              {/* Listing Agent + Agency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Listing Agent</label>
                  <input type="text" value={form.listing_agent} onChange={(e) => updateField('listing_agent', e.target.value)} placeholder="Agent name" className={inputCls} style={borderStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Listing Agency</label>
                  <input type="text" value={form.listing_agency} onChange={(e) => updateField('listing_agency', e.target.value)} placeholder="Agency name" className={inputCls} style={borderStyle} />
                </div>
              </div>

              {/* Last Listed Date + Result */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Listed Date</label>
                  <input type="date" value={form.last_listed_date} onChange={(e) => updateField('last_listed_date', e.target.value)} className={inputCls} style={borderStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Listing Result</label>
                  <select value={form.last_listing_result} onChange={(e) => updateField('last_listing_result', e.target.value)} className={inputCls} style={borderStyle}>
                    <option value="">Select…</option>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Sellability */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sellability (1–5)</label>
                <select value={form.sellability} onChange={(e) => updateField('sellability', e.target.value)} className={inputCls} style={borderStyle}>
                  <option value="">Select…</option>
                  <option value="1">1 — Very Low</option>
                  <option value="2">2 — Low</option>
                  <option value="3">3 — Moderate</option>
                  <option value="4">4 — High</option>
                  <option value="5">5 — Very High</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Any notes about this property…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors resize-none"
            style={borderStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !form.address.trim()}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#6FAF8F' }}
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Add Property
        </button>
      </form>
    </div>
  );
}
