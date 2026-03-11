import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useProperties, usePropertyBuyerInterest, usePropertyOwners, useAddBuyerInterest, useUpdateBuyerInterest, useDeleteBuyerInterest, useLinkOwner, useUnlinkOwner } from '@/hooks/useProperties';
import { useTerritories } from '@/hooks/useTerritories';
import { usePeople } from '@/hooks/usePeople';
import { personDisplayName } from '@/types';
import { usePropertySignals } from '@/hooks/useSignals';
import { SignalCard } from '@/components/shared/SignalCard';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { MatchCard } from '@/components/shared/MatchCard';
import { getPropertyBuyerMatches } from '@/lib/api';
import type { Property } from '@/types';
import { Search, Home, Loader2, ArrowLeft, MapPin, Bed, Bath, DollarSign, Tag, Users, Plus, X, ChevronDown, ChevronRight, Pencil, Flag } from 'lucide-react';
import { useCreateProperty } from '@/hooks/useProperties';
import { VoiceRecorder } from '@/components/shared/VoiceRecorder';
import { ListingChecklist } from '@/components/properties/ListingChecklist';
import { EditPropertyForm } from '@/components/properties/EditPropertyForm';
import type { PropertyCreate } from '@/types';

export default function Properties() {
  const { data: properties = [], isLoading, error } = useProperties();
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

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

  if (editingProperty) {
    return (
      <EditPropertyForm
        property={editingProperty}
        onClose={() => setEditingProperty(null)}
        onUpdated={() => {
          setEditingProperty(null);
          setSelectedProperty(null);
        }}
      />
    );
  }

  if (selectedProperty) {
    return (
      <PropertyDetailPanel
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
        onEdit={() => setEditingProperty(selectedProperty)}
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
const BUYER_STAGES = ['seen', 'interested', 'hot', 'offer', 'purchased'] as const;

function PropertyDetailPanel({ property, onBack, onEdit }: { property: Property; onBack: () => void; onEdit?: () => void }) {
  const { data: buyers = [] } = usePropertyBuyerInterest(property.id);
  const { data: owners = [] } = usePropertyOwners(property.id);
  const { data: signals = [] } = usePropertySignals(property.id);
  const { data: allPeople = [] } = usePeople();

  // Buyer interest state
  const addBuyer = useAddBuyerInterest();
  const updateBuyer = useUpdateBuyerInterest(property.id);
  const deleteBuyer = useDeleteBuyerInterest(property.id);
  const [showAddBuyer, setShowAddBuyer] = useState(false);
  const [newBuyer, setNewBuyer] = useState({
    person_name: '', status: 'seen', notes: '',
    price_min: '', price_max: '', bedrooms_min: '', bathrooms_min: '',
    land_size_min: '', preferred_suburbs: [] as string[], property_type_pref: '',
    special_features: [] as string[],
  });
  const [showPrefs, setShowPrefs] = useState(false);
  const [suburbInput, setSuburbInput] = useState('');
  const [editingBuyerId, setEditingBuyerId] = useState<number | null>(null);
  const [editBuyerData, setEditBuyerData] = useState({ status: '', notes: '' });

  // Owner linking state
  const linkOwnerMut = useLinkOwner();
  const unlinkOwnerMut = useUnlinkOwner(property.id);
  const [showLinkOwner, setShowLinkOwner] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [ownerRole, setOwnerRole] = useState('');

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{property.address}</h2>
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
        <div className="relate-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Owners</h3>
            <button
              onClick={() => setShowLinkOwner((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              style={{ color: '#6FAF8F' }}
            >
              <Plus className="w-3 h-3" />
              Link
            </button>
          </div>
          {showLinkOwner && (
            <div className="mb-3 p-3 rounded-lg space-y-2" style={{ backgroundColor: 'rgba(111,175,143,0.06)', border: '1px solid #ECEAE5' }}>
              <input
                type="text"
                placeholder="Search contacts…"
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                style={{ borderColor: '#ECEAE5' }}
              />
              {ownerSearch.trim() && (
                <div className="max-h-32 overflow-auto space-y-0.5">
                  {allPeople
                    .filter((p) => personDisplayName(p).toLowerCase().includes(ownerSearch.toLowerCase()))
                    .slice(0, 5)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedOwnerId(p.id); setOwnerSearch(personDisplayName(p)); }}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors ${
                          selectedOwnerId === p.id ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        {personDisplayName(p)}
                      </button>
                    ))}
                </div>
              )}
              <input
                type="text"
                placeholder="Role (optional)"
                value={ownerRole}
                onChange={(e) => setOwnerRole(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                style={{ borderColor: '#ECEAE5' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!selectedOwnerId) return;
                    await linkOwnerMut.mutateAsync({ propertyId: property.id, data: { person_id: selectedOwnerId, role: ownerRole.trim() || null } });
                    setShowLinkOwner(false); setOwnerSearch(''); setSelectedOwnerId(null); setOwnerRole('');
                  }}
                  disabled={!selectedOwnerId || linkOwnerMut.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: '#6FAF8F' }}
                >
                  Link Owner
                </button>
                <button onClick={() => { setShowLinkOwner(false); setOwnerSearch(''); setSelectedOwnerId(null); setOwnerRole(''); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {owners.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No owners linked</p>
          ) : (
            <div className="space-y-1">
              {owners.map((o) => (
                <div key={o.person_id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(111,175,143,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{[o.first_name, o.last_name].filter(Boolean).join(' ')}</p>
                      {o.role && <p className="text-xs text-gray-500">{o.role}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => unlinkOwnerMut.mutate(o.person_id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buyer Interest */}
        <div className="relate-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer Interest</h3>
            <button
              onClick={() => setShowAddBuyer((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              style={{ color: '#6FAF8F' }}
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
          {showAddBuyer && (
            <div className="mb-3 p-3 rounded-lg space-y-2" style={{ backgroundColor: 'rgba(111,175,143,0.06)', border: '1px solid #ECEAE5' }}>
              <input
                type="text"
                placeholder="Contact name"
                value={newBuyer.person_name}
                onChange={(e) => setNewBuyer((p) => ({ ...p, person_name: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                style={{ borderColor: '#ECEAE5' }}
              />
              <select
                value={newBuyer.status}
                onChange={(e) => setNewBuyer((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                style={{ borderColor: '#ECEAE5' }}
              >
                {BUYER_STAGES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newBuyer.notes}
                onChange={(e) => setNewBuyer((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                style={{ borderColor: '#ECEAE5' }}
              />

              {/* Collapsible Buyer Preferences */}
              <button
                type="button"
                onClick={() => setShowPrefs((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors py-1"
              >
                {showPrefs ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Buyer Preferences
              </button>
              {showPrefs && (
                <div className="space-y-2 pl-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Price Min (NZD)" value={newBuyer.price_min} onChange={(e) => setNewBuyer((p) => ({ ...p, price_min: e.target.value }))} className="px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30" style={{ borderColor: '#ECEAE5' }} />
                    <input type="number" placeholder="Price Max (NZD)" value={newBuyer.price_max} onChange={(e) => setNewBuyer((p) => ({ ...p, price_max: e.target.value }))} className="px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30" style={{ borderColor: '#ECEAE5' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={newBuyer.bedrooms_min} onChange={(e) => setNewBuyer((p) => ({ ...p, bedrooms_min: e.target.value }))} className="px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30" style={{ borderColor: '#ECEAE5' }}>
                      <option value="">Beds</option>
                      {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </select>
                    <select value={newBuyer.bathrooms_min} onChange={(e) => setNewBuyer((p) => ({ ...p, bathrooms_min: e.target.value }))} className="px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30" style={{ borderColor: '#ECEAE5' }}>
                      <option value="">Baths</option>
                      {[1,2,3,4].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </select>
                    <input type="number" placeholder="Land m²" value={newBuyer.land_size_min} onChange={(e) => setNewBuyer((p) => ({ ...p, land_size_min: e.target.value }))} className="px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30" style={{ borderColor: '#ECEAE5' }} />
                  </div>
                  <select value={newBuyer.property_type_pref} onChange={(e) => setNewBuyer((p) => ({ ...p, property_type_pref: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30" style={{ borderColor: '#ECEAE5' }}>
                    <option value="">Property Type</option>
                    {['house','apartment','townhouse','section','lifestyle'].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  {/* Preferred Suburbs tag input */}
                  <div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {newBuyer.preferred_suburbs.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                          {s}
                          <button type="button" onClick={() => setNewBuyer((p) => ({ ...p, preferred_suburbs: p.preferred_suburbs.filter((_, j) => j !== i) }))} className="hover:text-red-500">&times;</button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Type suburb, press Enter"
                      value={suburbInput}
                      onChange={(e) => setSuburbInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && suburbInput.trim()) {
                          e.preventDefault();
                          setNewBuyer((p) => ({ ...p, preferred_suburbs: [...p.preferred_suburbs, suburbInput.trim()] }));
                          setSuburbInput('');
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30"
                      style={{ borderColor: '#ECEAE5' }}
                    />
                  </div>
                  {/* Special Features checkboxes */}
                  <div className="grid grid-cols-2 gap-1">
                    {['Pool','School Zone','Double Garage','Sea Views','Single Level','New Build'].map((feat) => (
                      <label key={feat} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newBuyer.special_features.includes(feat)}
                          onChange={(e) => {
                            setNewBuyer((p) => ({
                              ...p,
                              special_features: e.target.checked
                                ? [...p.special_features, feat]
                                : p.special_features.filter((f) => f !== feat),
                            }));
                          }}
                          className="rounded border-gray-300 text-[#6FAF8F] focus:ring-[#6FAF8F]"
                        />
                        {feat}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!newBuyer.person_name.trim()) return;
                    await addBuyer.mutateAsync({
                      propertyId: property.id,
                      data: {
                        person_name: newBuyer.person_name.trim(),
                        status: newBuyer.status,
                        notes: newBuyer.notes.trim() || null,
                        price_min: newBuyer.price_min ? Number(newBuyer.price_min) : undefined,
                        price_max: newBuyer.price_max ? Number(newBuyer.price_max) : undefined,
                        bedrooms_min: newBuyer.bedrooms_min ? Number(newBuyer.bedrooms_min) : undefined,
                        bathrooms_min: newBuyer.bathrooms_min ? Number(newBuyer.bathrooms_min) : undefined,
                        land_size_min: newBuyer.land_size_min ? Number(newBuyer.land_size_min) : undefined,
                        preferred_suburbs: newBuyer.preferred_suburbs.length ? newBuyer.preferred_suburbs : undefined,
                        property_type_pref: newBuyer.property_type_pref || undefined,
                        special_features: newBuyer.special_features.length ? newBuyer.special_features : undefined,
                      },
                    });
                    setNewBuyer({ person_name: '', status: 'seen', notes: '', price_min: '', price_max: '', bedrooms_min: '', bathrooms_min: '', land_size_min: '', preferred_suburbs: [], property_type_pref: '', special_features: [] });
                    setShowPrefs(false); setSuburbInput(''); setShowAddBuyer(false);
                  }}
                  disabled={!newBuyer.person_name.trim() || addBuyer.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: '#6FAF8F' }}
                >
                  Add Buyer
                </button>
                <button onClick={() => { setShowAddBuyer(false); setNewBuyer({ person_name: '', status: 'seen', notes: '', price_min: '', price_max: '', bedrooms_min: '', bathrooms_min: '', land_size_min: '', preferred_suburbs: [], property_type_pref: '', special_features: [] }); setShowPrefs(false); setSuburbInput(''); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {buyers.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No buyer interest recorded</p>
          ) : (
            <div className="space-y-1">
              {buyers.map((b) => (
                <div key={b.id} className="px-3 py-2 rounded-lg bg-gray-50">
                  {editingBuyerId === b.id ? (
                    <div className="space-y-2">
                      <select
                        value={editBuyerData.status}
                        onChange={(e) => setEditBuyerData((p) => ({ ...p, status: e.target.value }))}
                        className="w-full px-2 py-1 rounded border bg-white text-sm"
                        style={{ borderColor: '#ECEAE5' }}
                      >
                        {BUYER_STAGES.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editBuyerData.notes}
                        onChange={(e) => setEditBuyerData((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Notes"
                        className="w-full px-2 py-1 rounded border bg-white text-sm"
                        style={{ borderColor: '#ECEAE5' }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await updateBuyer.mutateAsync({ interestId: b.id, data: { status: editBuyerData.status, notes: editBuyerData.notes.trim() || null } });
                            setEditingBuyerId(null);
                          }}
                          className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: '#6FAF8F' }}
                        >
                          Save
                        </button>
                        <button onClick={() => setEditingBuyerId(null)} className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100">Cancel</button>
                        <button
                          onClick={async () => { await deleteBuyer.mutateAsync(b.id); setEditingBuyerId(null); }}
                          className="px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50 ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingBuyerId(b.id); setEditBuyerData({ status: b.status || 'seen', notes: b.notes || '' }); }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{b.person_name || `Person #${b.person_id}`}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {b.status && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'rgba(111,175,143,0.12)', color: '#4a8a6a' }}>
                                {b.status}
                              </span>
                            )}
                            {b.notes && <span className="text-xs text-gray-500 truncate">{b.notes}</span>}
                          </div>
                        </div>
                        {b.interest_level != null && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span key={n} className="w-1.5 h-4 rounded-full" style={{ backgroundColor: n <= b.interest_level! ? '#6FAF8F' : '#e5e7eb' }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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

        {/* Matching Buyers */}
        <MatchingBuyersSection propertyId={property.id} />

        {/* Territories */}
        <TerritoryChips propertyId={property.id} />

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
      const sellabilityMap: Record<string, { score: number; label: string }> = {
        '1': { score: 0.2, label: 'Very Low' },
        '2': { score: 0.4, label: 'Low' },
        '3': { score: 0.6, label: 'Moderate' },
        '4': { score: 0.8, label: 'High' },
        '5': { score: 1.0, label: 'Very High' },
      };
      const sellEntry = form.sellability ? sellabilityMap[form.sellability] : null;
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
        council_valuation: form.cv ? Number(form.cv.replace(/[^0-9.]/g, '')) : null,
        land_area: form.land_area ? Number(form.land_area.replace(/[^0-9.]/g, '')) : null,
        last_sold_amount: form.last_sold_amount ? Number(form.last_sold_amount) : null,
        last_sold_date: form.last_sold_date?.trim() || null,
        current_listing_price: form.current_listing_price ? Number(form.current_listing_price) : null,
        listing_url: form.listing_url?.trim() || null,
        listing_agent: form.listing_agent?.trim() || null,
        listing_agency: form.listing_agency?.trim() || null,
        last_listed_date: form.last_listed_date?.trim() || null,
        last_listing_result: form.last_listing_result?.trim() || null,
        sellability_score: sellEntry?.score ?? null,
        sellability_label: sellEntry?.label ?? null,
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

// ── Territory Chips ──
const TERRITORY_TYPE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  core_territory: { label: 'Core Territory', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  expansion_zone: { label: 'Expansion Zone', color: 'text-amber-700', bg: 'bg-amber-50' },
  tactical_route: { label: 'Route', color: 'text-blue-700', bg: 'bg-blue-50' },
};

function TerritoryChips({ propertyId }: { propertyId: number }) {
  const { data: territories = [] } = useTerritories();

  // Filter territories that contain this property
  const linked = territories.filter((t: any) =>
    t.properties?.some((p: any) => String(p.id || p.property_id) === String(propertyId))
  );

  if (linked.length === 0) return null;

  return (
    <div className="relate-card p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Flag className="w-3 h-3" />
        Territories
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {linked.map((t: any) => {
          const cfg = TERRITORY_TYPE_STYLES[t.type] || TERRITORY_TYPE_STYLES.core_territory;
          return (
            <span
              key={t.id}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}
            >
              <Flag className="w-2.5 h-2.5" />
              {t.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MatchingBuyersSection({ propertyId }: { propertyId: number }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPropertyBuyerMatches(propertyId)
      .then((data) => { if (!cancelled) setMatches(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setMatches([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [propertyId]);

  return (
    <div className="relate-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Matching Buyers</h3>
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
      ) : matches.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No matching buyers yet</p>
      ) : (
        <div className="space-y-2">
          {matches.slice(0, 5).map((m: any, i: number) => (
            <MatchCard
              key={m.person?.id || i}
              type="buyer"
              name={m.person ? `${m.person.first_name} ${m.person.last_name || ''}`.trim() : (m.buyer_interest?.person_name || 'Unknown')}
              score={m.score_pct ?? m.score ?? 0}
              reasons={m.reasons || []}
              onClick={() => {
                if (m.person?.id) setLocation(`/people/${m.person.id}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
