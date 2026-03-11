import { useState } from 'react';
import type { Property, PropertyCreate } from '@/types';
import { useUpdateProperty } from '@/hooks/useProperties';
import { VoiceRecorder } from '@/components/shared/VoiceRecorder';
import { X, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

const LISTING_HISTORY_FIELDS = [
  'cv', 'last_sold_amount', 'last_sold_date', 'current_listing_price',
  'listing_url', 'listing_agent', 'listing_agency', 'last_listed_date',
  'last_listing_result', 'sellability', 'notes',
];

interface EditPropertyFormProps {
  property: Property;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditPropertyForm({ property, onClose, onUpdated }: EditPropertyFormProps) {
  const updateProp = useUpdateProperty();

  // Derive sellability string from score
  function scoreToSellability(score: number | null): string {
    if (score == null) return '';
    if (score <= 0.2) return '1';
    if (score <= 0.4) return '2';
    if (score <= 0.6) return '3';
    if (score <= 0.8) return '4';
    return '5';
  }

  const [form, setForm] = useState<Record<string, string>>({
    address: property.address,
    suburb: property.suburb ?? '',
    city: property.city ?? '',
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
    property_type: property.property_type ?? '',
    estimated_value: property.estimated_value != null ? String(property.estimated_value) : '',
    land_area: property.land_area != null ? String(property.land_area) : '',
    cv: property.council_valuation != null ? String(property.council_valuation) : '',
    last_sold_amount: '',
    last_sold_date: '',
    current_listing_price: '',
    listing_url: '',
    listing_agent: '',
    listing_agency: '',
    last_listed_date: '',
    last_listing_result: '',
    sellability: scoreToSellability(property.sellability_score),
    notes: property.notes ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

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
      const payload: Partial<PropertyCreate> = {
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
      await updateProp.mutateAsync({ id: property.id, data: payload });
      onUpdated();
    } catch {
      // Error handled by mutation
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors';
  const borderStyle = { borderColor: '#ECEAE5' };

  return (
    <div className="p-6 max-w-lg">
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-4"
      >
        <X className="w-3.5 h-3.5" />
        Cancel
      </button>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Edit Property</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voice Fill */}
        <VoiceRecorder
          parseEndpoint="/api/v1/properties/parse-voice"
          label="Speak to update"
          onTranscript={() => {}}
          onParsed={(data: any) => {
            if (data.address) updateField('address', data.address);
            if (data.suburb) updateField('suburb', data.suburb);
            if (data.city) updateField('city', data.city);
            if (data.bedrooms !== undefined && data.bedrooms !== null) updateField('bedrooms', String(data.bedrooms));
            if (data.bathrooms !== undefined && data.bathrooms !== null) updateField('bathrooms', String(data.bathrooms));
            if (data.land_area || data.land_size) updateField('land_area', data.land_area || data.land_size);
            if (data.property_type) updateField('property_type', data.property_type);
            if (data.estimated_value || data.cv) updateField('estimated_value', data.estimated_value || data.cv);
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
            if (hasHistoryData) setHistoryExpanded(true);
          }}
        />

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
          <input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} className={inputCls} style={borderStyle} required />
        </div>

        {/* Suburb + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Suburb</label>
            <input type="text" value={form.suburb} onChange={(e) => updateField('suburb', e.target.value)} className={inputCls} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
            <input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className={inputCls} style={borderStyle} />
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
            <input type="text" value={form.property_type} onChange={(e) => updateField('property_type', e.target.value)} className={inputCls} style={borderStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Value</label>
            <input type="text" value={form.estimated_value} onChange={(e) => updateField('estimated_value', e.target.value)} className={inputCls} style={borderStyle} />
          </div>
        </div>

        {/* Listing History & Intelligence (collapsible) */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #ECEAE5' }}>
          <button
            type="button"
            onClick={() => setHistoryExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Listing History &amp; Intelligence
            </span>
            {historyExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>

          {historyExpanded && (
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #ECEAE5' }}>
              <div className="pt-3" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CV / Estimated Value</label>
                <input type="text" value={form.cv} onChange={(e) => updateField('cv', e.target.value)} placeholder="$1,200,000" className={inputCls} style={borderStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Sold Amount</label>
                  <input type="number" value={form.last_sold_amount} onChange={(e) => updateField('last_sold_amount', e.target.value)} className={inputCls} style={borderStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Sold Date</label>
                  <input type="date" value={form.last_sold_date} onChange={(e) => updateField('last_sold_date', e.target.value)} className={inputCls} style={borderStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Listing Price</label>
                <input type="number" value={form.current_listing_price} onChange={(e) => updateField('current_listing_price', e.target.value)} className={inputCls} style={borderStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Listing URL</label>
                <input type="url" value={form.listing_url} onChange={(e) => updateField('listing_url', e.target.value)} className={inputCls} style={borderStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Listing Agent</label>
                  <input type="text" value={form.listing_agent} onChange={(e) => updateField('listing_agent', e.target.value)} className={inputCls} style={borderStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Listing Agency</label>
                  <input type="text" value={form.listing_agency} onChange={(e) => updateField('listing_agency', e.target.value)} className={inputCls} style={borderStyle} />
                </div>
              </div>
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
          Save Changes
        </button>
      </form>
    </div>
  );
}
