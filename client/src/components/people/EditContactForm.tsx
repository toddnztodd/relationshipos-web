import { useState, useMemo } from 'react';
import type { Person, PersonCreate } from '@/types';
import { personDisplayName } from '@/types';
import { useUpdatePerson, usePeople } from '@/hooks/usePeople';
import { createReferral } from '@/lib/api';
import { VoiceRecorder } from '@/components/shared/VoiceRecorder';
import { X, Loader2 } from 'lucide-react';

interface EditContactFormProps {
  person: Person;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditContactForm({ person, onClose, onUpdated }: EditContactFormProps) {
  const updatePerson = useUpdatePerson();
  const [form, setForm] = useState<Partial<PersonCreate>>({
    first_name: person.first_name,
    last_name: person.last_name ?? '',
    phone: person.phone,
    email: person.email ?? '',
    suburb: person.suburb ?? '',
    notes: person.notes ?? '',
    tier: person.tier,
    preferred_contact_channel: person.preferred_contact_channel ?? '',
    nickname: person.nickname ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [referredById, setReferredById] = useState<number | null>(person.referred_by_id ? Number(person.referred_by_id) : null);
  const [referrerSearch, setReferrerSearch] = useState('');
  const [showReferrerDropdown, setShowReferrerDropdown] = useState(false);
  const { data: allPeople = [] } = usePeople();

  const referrerMatches = useMemo(() => {
    if (!referrerSearch.trim()) return [];
    const q = referrerSearch.toLowerCase();
    return allPeople.filter(p => p.id !== person.id && personDisplayName(p).toLowerCase().includes(q)).slice(0, 5);
  }, [referrerSearch, allPeople, person.id]);

  function updateField(field: keyof PersonCreate, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name?.trim() || !form.phone?.trim()) return;
    setSubmitting(true);
    try {
      await updatePerson.mutateAsync({
        id: person.id,
        data: {
          first_name: form.first_name!.trim(),
          phone: form.phone!.trim(),
          last_name: form.last_name?.trim() || null,
          email: form.email?.trim() || null,
          suburb: form.suburb?.trim() || null,
          notes: form.notes?.trim() || null,
          tier: form.tier,
          preferred_contact_channel: form.preferred_contact_channel?.trim() || null,
          nickname: form.nickname?.trim() || null,
        },
      });
      // Create referral link if newly set
      if (referredById && !person.referred_by_id) {
        try {
          await createReferral({ referrer_person_id: String(referredById), referred_person_id: String(person.id) });
        } catch { /* silent */ }
      }
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
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Edit Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voice Fill */}
        <VoiceRecorder
          parseEndpoint="/api/v1/people/parse-voice"
          label="Speak to update"
          onTranscript={() => {}}
          onParsed={(data: any) => {
            if (data.first_name) updateField('first_name', data.first_name);
            if (data.last_name) updateField('last_name', data.last_name);
            if (data.phone) updateField('phone', data.phone);
            if (data.email) updateField('email', data.email);
            if (data.suburb) updateField('suburb', data.suburb);
            if (data.notes) updateField('notes', data.notes);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
            <input
              type="text"
              value={form.first_name ?? ''}
              onChange={(e) => updateField('first_name', e.target.value)}
              className={inputCls}
              style={borderStyle}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              value={form.last_name ?? ''}
              onChange={(e) => updateField('last_name', e.target.value)}
              className={inputCls}
              style={borderStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className={inputCls}
            style={borderStyle}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => updateField('email', e.target.value)}
            className={inputCls}
            style={borderStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Suburb</label>
            <input
              type="text"
              value={form.suburb ?? ''}
              onChange={(e) => updateField('suburb', e.target.value)}
              className={inputCls}
              style={borderStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nickname</label>
            <input
              type="text"
              value={form.nickname ?? ''}
              onChange={(e) => updateField('nickname', e.target.value)}
              className={inputCls}
              style={borderStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
          <select
            value={form.tier ?? 'C'}
            onChange={(e) => updateField('tier', e.target.value)}
            className={inputCls}
            style={borderStyle}
          >
            <option value="A">A — Top Priority</option>
            <option value="B">B — Active</option>
            <option value="C">C — Nurture</option>
          </select>
        </div>

        {/* Referred By */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">Referred By</label>
          {referredById ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm" style={borderStyle}>
              <span className="flex-1 text-gray-800">{personDisplayName(allPeople.find(p => p.id === referredById) || { first_name: 'Selected' })}</span>
              <button type="button" onClick={() => { setReferredById(null); setReferrerSearch(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={referrerSearch}
              onChange={(e) => { setReferrerSearch(e.target.value); setShowReferrerDropdown(true); }}
              onFocus={() => setShowReferrerDropdown(true)}
              onBlur={() => setTimeout(() => setShowReferrerDropdown(false), 200)}
              placeholder="Search contacts\u2026"
              className={inputCls}
              style={borderStyle}
            />
          )}
          {showReferrerDropdown && referrerMatches.length > 0 && !referredById && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-lg shadow-lg border border-gray-200 bg-white z-20 py-1 max-h-40 overflow-auto">
              {referrerMatches.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setReferredById(p.id); setReferrerSearch(''); setShowReferrerDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-gray-500" style={{ backgroundColor: 'rgba(111,175,143,0.12)' }}>
                    {p.first_name.charAt(0).toUpperCase()}
                  </span>
                  {personDisplayName(p)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6FAF8F]/30 focus:border-[#6FAF8F] transition-colors resize-none"
            style={borderStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !form.first_name?.trim() || !form.phone?.trim()}
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
